import { useEffect, useRef, useState, useMemo } from "react";
import type { PetResponseDto } from "@pet-evolution/shared";
import { getEnvironmentConfig, type Environment } from "../config";

/**
 * Hook: 根据环境和宠物信息计算 Spine 资源 URL
 */
export function useSpineResources(
  pet: PetResponseDto | undefined,
  environment: Environment = (() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "dev";
    }
    return "test";
  })(),
) {
  return useMemo(() => {
    if (!pet?.resource_folder) return { jsonUrl: null, atlasUrl: null };

    const config = getEnvironmentConfig(environment);
    const baseUrl = config.staticBaseUrl.replace(/\/$/, "");

    const folderName = pet.resource_folder.replace(/^\//, "");
    const fullPath = `${baseUrl}/${folderName}/${folderName}`;

    return {
      jsonUrl: `${fullPath}.json`,
      atlasUrl: `${fullPath}.atlas`,
      imageName: `${fullPath}.png`,
    };
  }, [pet?.resource_folder, environment]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        playerRef.current = new spine.SpinePlayer(playerDiv, {
          jsonUrl,
          atlasUrl,
          premultipliedAlpha: true,
          backgroundColor: "#aaaaaa",
          alpha: true,
          showControls: true,
          preserveDrawingBuffer: true,
          debug: {
            bones: true,
            regions: true,
            mesh: true,
            bounds: true,
            paths: true,
            clipping: true,
          },
          fitToCanvas: false,
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

              if (!skeleton.physics) skeleton.physics = [];

              console.log("🦴 Skeleton Data:", {
                x: skeleton.data.x,
                y: skeleton.data.y,
                width: skeleton.data.width,
                height: skeleton.data.height,
              });

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
          error: (_p: any, msg: string) => {
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
