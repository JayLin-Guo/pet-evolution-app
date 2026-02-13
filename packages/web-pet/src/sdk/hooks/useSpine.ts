import { useEffect, useRef, useState, useMemo } from "react";
import type { Pet } from "@pet-evolution/shared";
import { getEnvironmentConfig, type Environment } from "../config";

/**
 * Hook: 根据环境和宠物信息计算 Spine 资源 URL
 */
export function useSpineResources(
  pet: Pet | undefined,
  environment: Environment = (() => {
    // 本地开发时默认走 dev（避免 /api/static 落到前端 dev server 返回 index.html）
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "dev";
    }
    return "test";
  })(),
) {
  return useMemo(() => {
    if (!pet?.spinePath) return { jsonUrl: null, atlasUrl: null };

    pet.spinePath = "mon_acorn_girl_03/mon_acorn_girl_03";

    const config = getEnvironmentConfig(environment);
    const baseUrl = config.staticBaseUrl.replace(/\/$/, "");

    const rawPath = pet.spinePath.startsWith("/")
      ? pet.spinePath
      : `/${pet.spinePath}`;

    const fullPath = `${baseUrl}${rawPath}`;

    return {
      jsonUrl: `${fullPath}.json`,
      atlasUrl: `${fullPath}.atlas`,
      imageName: `${fullPath}.png`,
    };
  }, [pet?.spinePath, environment]);
}

/**
 * Hook: 管理 Spine Player 的加载、初始化和销毁
 */
export function useSpinePlayer(
  container: HTMLDivElement | null,
  jsonUrl: string | null,
  atlasUrl: string | null,
) {
  const playerRef = useRef<any>(null);
  const prevUrlRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载 Spine 库和初始化 Player
  useEffect(() => {
    if (!jsonUrl || !atlasUrl || !container) {
      console.log("useSpinePlayer", jsonUrl, atlasUrl, container);
      if (!jsonUrl) {
        setIsLoading(false);
      }
      return;
    }

    const loadSpineAndInit = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!(window as any).spine) {
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/@esotericsoftware/spine-player@4.2.45/dist/iife/spine-player.js";
          script.async = true;

          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://unpkg.com/@esotericsoftware/spine-player@4.2.45/dist/spine-player.css";

          document.head.appendChild(link);
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("Failed to load Spine 4.2"));
            setTimeout(
              () => reject(new Error("Timeout loading Spine 4.2")),
              20000,
            );
          });
        }

        const spine = (window as any).spine;

        if (!container) return;
        container.innerHTML = "";
        const playerDiv = document.createElement("div");
        playerDiv.style.width = "100%";
        playerDiv.style.height = "100%";
        container.appendChild(playerDiv);

        if (playerRef.current) {
          try {
            if (typeof playerRef.current.dispose === "function")
              playerRef.current.dispose();
          } catch (e) {}
        }

        // ----------------------------------------------------------------
        // 🕵️‍ Debug 模式全开：为了找到那个隐形的宠物！
        // ----------------------------------------------------------------
        playerRef.current = new spine.SpinePlayer(playerDiv, {
          jsonUrl,
          atlasUrl,
          premultipliedAlpha: true,

          // 1. 背景设为灰色，确保 Canvas 真的渲染了
          backgroundColor: "#aaaaaa",

          alpha: true,
          showControls: true,
          preserveDrawingBuffer: true,

          // 2. 开启 Debug 渲染：画骨头、画边界
          debug: {
            bones: true,
            regions: true,
            mesh: true,
            bounds: true,
            paths: true,
            clipping: true,
          },

          // 3. 核心避坑配置
          fitToCanvas: false,

          // 4. 超级广角视口：覆盖 (-1500, -1500) 到 (1500, 1500)
          // 强制以 (0,0) 为中心
          viewport: {
            x: -1500,
            y: -1500,
            width: 3000,
            height: 3000,
            padLeft: "0%",
            padRight: "0%",
            padTop: "0%",
            padBottom: "0%",
          },

          success: (p: any) => {
            setIsLoading(false);

            try {
              const state = p.animationState;
              const skeleton = p.skeleton;

              // 物理补丁
              if (!skeleton.physics) skeleton.physics = [];

              // 强制重置姿态
              // skeleton.setToSetupPose();

              console.log("🦴 Skeleton Data:", {
                x: skeleton.data.x,
                y: skeleton.data.y,
                width: skeleton.data.width,
                height: skeleton.data.height,
              });

              // 启动动画
              const animations = p.skeleton.data.animations.map(
                (a: any) => a.name,
              );
              const targetAnim = animations.includes("idle2")
                ? "idle2"
                : animations[0];
              if (targetAnim) {
                state.setAnimation(0, targetAnim, true);
                console.log(`🚀 Animated via State: ${targetAnim}`);
              }
            } catch (e) {
              console.error("❌ Spine setup failed:", e);
            }
          },
          error: (p: any, msg: string) => {
            setIsLoading(false);
            console.error("❌ Spine Error:", msg);
            setError(`Spine Error: ${msg}`);
          },
        });
      } catch (e: any) {
        setIsLoading(false);
        setError(e.message || "Unknown error");
      }
    };

    loadSpineAndInit();

    return () => {
      if (playerRef.current) {
        try {
          // 兼容性清理：有些版本可能是 dispose，有些可能是 destroy
          if (typeof playerRef.current.dispose === "function") {
            playerRef.current.dispose();
          } else if (typeof playerRef.current.destroy === "function") {
            playerRef.current.destroy();
          }
        } catch (e) {
          console.warn("清理 player 失败:", e);
        }
        playerRef.current = null;
      }
    };
  }, [jsonUrl, atlasUrl, container]);

  return { isLoading, error };
}
