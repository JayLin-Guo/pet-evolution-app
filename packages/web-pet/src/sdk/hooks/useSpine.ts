import { useEffect, useRef, useState, useMemo } from "react";
import { PetAnimation, type Pet } from "@pet-evolution/shared";
import { getEnvironmentConfig, type Environment } from "../config";

/**
 * Hook: 根据环境和宠物信息计算 Spine 资源 URL
 */
export function useSpineResources(
  pet: Pet | undefined,
  environment: Environment = "test",
) {
  return useMemo(() => {
    if (!pet?.spinePath) return { jsonUrl: null, atlasUrl: null };

    const config = getEnvironmentConfig(environment);
    const baseUrl = config.staticBaseUrl.replace(/\/$/, "");
    const path = pet.spinePath.startsWith("/")
      ? pet.spinePath
      : `/${pet.spinePath}`;

    const fullPath = `${baseUrl}${path}`;
    return {
      jsonUrl: `${fullPath}.json`,
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
  animation: string,
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
          script.src =
            "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/iife/spine-player.js";
          script.async = true;

          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/spine-player.css";

          document.head.appendChild(link);
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("Failed to load spine-player.js"));
            // 超时保护
            setTimeout(
              () => reject(new Error("Spine player load timeout")),
              10000,
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
        playerRef.current = new spine.SpinePlayer(playerDiv, {
          jsonUrl,
          atlasUrl,
          animation,
          premultipliedAlpha: true,
          backgroundColor: "#00000000",
          alpha: true,
          showControls: false,
          preserveDrawingBuffer: false,
          fitToCanvas: true,
          viewport: {
            padLeft: "10%",
            padRight: "10%",
            padTop: "10%",
            padBottom: "10%",
          },
          success: () => {
            setIsLoading(false);
            setError(null);
            console.log("✅ Spine 加载成功！", {
              jsonUrl,
              atlasUrl,
              animation,
            });

            // 确保动画开始播放
            if (playerRef.current?.skeleton?.data?.animations) {
              const animations = playerRef.current.skeleton.data.animations.map(
                (anim: any) => anim.name,
              );
              const hasAnimation = animations.includes(animation);
              if (hasAnimation) {
                playerRef.current.setAnimation(animation, true);
              } else {
                console.warn("⚠️ 动画不存在，使用 idle2");
                playerRef.current.setAnimation(PetAnimation.IDLE2, true);
              }
            }
          },
          error: (_: any, msg: string) => {
            setIsLoading(false);
            setError(msg);
            console.error("❌ Spine 加载失败:", msg);
          },
        });
      } catch (e: any) {
        setIsLoading(false);
        const errorMsg = e?.message || "未知错误";
        setError(errorMsg);
        console.error("❌ Spine 初始化失败:", e);
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

  // 监听 animation 变化并切换动画
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.skeleton) return;

    try {
      const animationData = playerRef.current.skeleton.data;
      const hasAnimation = animationData.animations.some(
        (anim: any) => anim.name === animation,
      );

      if (hasAnimation) {
        playerRef.current.setAnimation(animation, true);
      } else {
        console.warn("⚠️ 动画不存在，使用 idle2");
        playerRef.current.setAnimation(PetAnimation.IDLE2, true);
      }
    } catch (e) {
      console.error("切换动画失败:", e);
    }
  }, [animation]);

  return { isLoading, error };
}
