import { useEffect, useRef, useState } from "react";
import type { Pet } from "@pet-evolution/shared";

interface SpinePetProps {
  /** Spine 资源基础 URL，例如 "http://47.93.247.175:8080/static/mon_earth_dragon_01_v38/" */
  spineBaseUrl: string | null | undefined;
  /** 当前要播放的动画名称 */
  animation?: string;
  /** 宠物信息（用于根据阶段选择资源） */
  pet?: Pet;
}

/**
 * Spine 动画宠物组件
 * 使用 @esotericsoftware/spine-player 渲染 Spine 动画
 */
export function SpinePet({ spineBaseUrl, animation = "idle2", pet }: SpinePetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 根据资源后缀和基础 URL 构建资源路径
  const getResourcePath = (filename: string): string | null => {
    if (!spineBaseUrl) return null;
    // 确保 baseUrl 以 / 结尾
    const base = spineBaseUrl.endsWith("/") ? spineBaseUrl : spineBaseUrl + "/";
    return `${base}${filename}`;
  };

  // 从 spineBaseUrl 提取资源名称（假设 URL 格式为 .../static/resource_name/）
  const getResourceName = (): string => {
    if (!spineBaseUrl) return "mon_earth_dragon_01";
    // 从 URL 中提取资源名称，例如从 "http://.../static/mon_earth_dragon_01_v38/" 提取 "mon_earth_dragon_01"
    const match = spineBaseUrl.match(/\/([^/]+)\/?$/);
    if (match && match[1]) {
      // 如果资源名称包含版本号（如 mon_earth_dragon_01_v38），提取基础名称
      const name = match[1];
      // 移除版本号后缀（如 _v38）
      return name.replace(/_v\d+$/, "").replace(/_\d+$/, "") || "mon_earth_dragon_01";
    }
    return "mon_earth_dragon_01";
  };

  useEffect(() => {
    // 如果没有 spineBaseUrl，不加载
    if (!spineBaseUrl || !containerRef.current) {
      setIsLoading(false);
      return;
    }

    const loadSpine = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 动态加载 spine-player 库（如果尚未加载）
        if (!(window as any).spine) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/iife/spine-player.js";
          script.async = true;
          
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/spine-player.css";

          document.head.appendChild(link);
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load spine-player.js"));
            // 超时保护
            setTimeout(() => reject(new Error("Spine player load timeout")), 10000);
          });
        }

        if (!containerRef.current) return;

        const spine = (window as any).spine;
        const resourceName = getResourceName();
        const jsonUrl = getResourcePath(`${resourceName}.json`);
        const atlasUrl = getResourcePath(`${resourceName}.atlas`);

        if (!jsonUrl || !atlasUrl) {
          throw new Error("无法构建资源 URL");
        }

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
            console.log("✅ Spine 加载成功！", { jsonUrl, atlasUrl, animation });

            // 确保动画开始播放
            if (playerRef.current?.skeleton?.data?.animations) {
              const animations = playerRef.current.skeleton.data.animations.map((anim: any) => anim.name);
              console.log("📋 可用动画:", animations);

              const hasAnimation = animations.includes(animation);
              if (hasAnimation) {
                console.log("✅ 播放动画:", animation);
                playerRef.current.setAnimation(animation, true);
              } else {
                console.warn("⚠️ 动画不存在，使用 idle2");
                playerRef.current.setAnimation("idle2", true);
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

    loadSpine();

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
  }, [spineBaseUrl]); // 只在 spineBaseUrl 变化时重新加载

  // 切换动画
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.skeleton) return;

    try {
      const animationData = playerRef.current.skeleton.data;
      const hasAnimation = animationData.animations.some((anim: any) => anim.name === animation);

      if (hasAnimation) {
        playerRef.current.setAnimation(animation, true);
        console.log("🎬 切换动画:", animation);
      } else {
        console.warn("⚠️ 动画不存在，使用 idle2");
        playerRef.current.setAnimation("idle2", true);
      }
    } catch (e) {
      console.error("切换动画失败:", e);
    }
  }, [animation]);

  // 如果没有 spineBaseUrl，显示占位符
  if (!spineBaseUrl) {
    return (
      <div className="pet-placeholder">
        <span className="pet-emoji">🐲</span>
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="pet-placeholder">
        <span className="pet-emoji">⏳</span>
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="pet-placeholder">
        <span className="pet-emoji">❌</span>
        <div style={{ fontSize: "12px", color: "#ff4444", marginTop: "8px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}

