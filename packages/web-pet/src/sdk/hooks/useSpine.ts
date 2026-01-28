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

    pet.spinePath = "mon_bat_demon_02/mon_bat_demon_02";
    // pet.spinePath = "mon_earth_dragon_01/mon_earth_dragon_01";
    const config = getEnvironmentConfig(environment);
    const baseUrl = config.staticBaseUrl.replace(/\/$/, "");

    const rawPath = pet.spinePath.startsWith("/")
      ? pet.spinePath
      : `/${pet.spinePath}`;
    const fullPath = `${baseUrl}${rawPath}`;

    return {
      jsonUrl: `${fullPath}_v38.json`,
      atlasUrl: `${fullPath}.atlas`,
    };
  }, [pet?.spinePath, environment]);
}

/**
 * Hook: 管理 Spine Player 的加载、初始化和销毁
 */
export function useSpinePlayer(
  containerRef: React.RefObject<HTMLDivElement>,
  jsonUrl: string | null,
  atlasUrl: string | null,
) {
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载 Spine 库和初始化 Player
  useEffect(() => {
    if (!jsonUrl || !atlasUrl || !containerRef.current) {
      console.log("useSpinePlayer", jsonUrl, atlasUrl, containerRef);
      if (!jsonUrl) {
        setIsLoading(false);
      }
      return;
    }

    const loadSpineAndInit = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 动态加载 spine-player 库（如果尚未加载）
        if (!(window as any).spine) {
          const script = document.createElement("script");
          script.src = "/spine-player.js";
          script.async = true;

          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "/spine-player.css";

          document.head.appendChild(link);
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () =>
              reject(
                new Error(
                  "Failed to load spine-player.js (check /spine-player.js is reachable)",
                ),
              );
            // 超时保护
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Spine player load timeout (check /spine-player.js is reachable)",
                  ),
                ),
              15000,
            );
          });
        }

        if (!containerRef.current) return;

        const spine = (window as any).spine;

        // 清空容器
        containerRef.current.innerHTML = "";
        const playerDiv = document.createElement("div");
        playerDiv.style.width = "100%";
        playerDiv.style.height = "100%";
        containerRef.current.appendChild(playerDiv);

        // 清理旧的 player
        if (playerRef.current) {
          try {
            playerRef.current.dispose();
          } catch (e) {
            console.warn("清理旧 player 失败:", e);
          }
        }

        // 创建新的 SpinePlayer
        // 注意：不在初始化时传入 animation，避免动画不存在时报错
        playerRef.current = new spine.SpinePlayer(playerDiv, {
          jsonUrl,
          atlasUrl,
          // animation, // 移除这里，在 success 回调中设置
          premultipliedAlpha: true,
          backgroundColor: "#00000000",
          alpha: true,
          showControls: false,
          preserveDrawingBuffer: false,
          success: () => {
            setIsLoading(false);
            setError(null);
            console.log("✅ Spine 加载成功！", {
              jsonUrl,
              atlasUrl,
            });

            const animation = "idle2";

            // 智能选择动画：优先使用指定动画，否则使用第一个可用动画
            if (playerRef.current?.skeleton?.data?.animations) {
              const animations = playerRef.current.skeleton.data.animations.map(
                (anim: any) => anim.name,
              );

              console.log("📋 可用动画列表:", animations);

              if (animations.length === 0) {
                return;
              }

              const targetAnimation = animations.includes(animation)
                ? animation
                : animations[1];

              console.log("targetAnimation", targetAnimation);

              playerRef.current.setAnimation(targetAnimation, true);
            }
          },
          error: (_: any, msg: string) => {
            setIsLoading(false);
            setError(msg);
          },
        });
      } catch (e: any) {
        setIsLoading(false);
        const errorMsg = e?.message || "未知错误";
        setError(errorMsg);
      }
    };

    loadSpineAndInit();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (e) {
          console.warn("清理 player 失败:", e);
        }
        playerRef.current = null;
      }
    };
  }, [jsonUrl, atlasUrl]); // 只在 URL 变化时重新加载

  return { isLoading, error };
}
