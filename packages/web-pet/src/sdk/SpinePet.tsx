import { useRef } from "react";
import { type Pet, PetAnimation } from "@pet-evolution/shared";
import { type Environment } from "./config";
import { useSpinePlayer, useSpineResources } from "./hooks/useSpine";

interface SpinePetProps {
  /**
   * 当前环境标识，用于获取静态资源前缀 (staticBaseUrl)
   * 默认为 'test'
   */
  environment?: Environment;

  /** 宠物信息（包含 spinePath） */
  pet?: Pet;
}

/**
 * Spine 动画宠物组件
 * 使用 @esotericsoftware/spine-player 渲染 Spine 动画
 */
export function SpinePet({
  environment = (() => {
    // 本地开发时默认走 dev（否则 /api/static 会落到 3000 返回 index.html）
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "dev";
    }
    return "test";
  })(),

  pet,
}: SpinePetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 获取资源 URL
  const { jsonUrl, atlasUrl } = useSpineResources(pet, environment);

  // 2. 初始化 Player 并管理生命周期
  const { isLoading, error } = useSpinePlayer(containerRef, jsonUrl, atlasUrl);

  // 如果没有 jsonUrl (即没有 pet.spinePath)，显示占位符
  if (!jsonUrl) {
    return (
      <div className="pet-placeholder">
        <span className="pet-emoji">🐲</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 始终渲染 Spine 容器，以便 ref 能够被 hook 获取到 */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // 在加载中或出错时隐藏容器内容，避免视觉干扰
          visibility: isLoading || error ? "hidden" : "visible",
        }}
      />

      {/* 加载中状态遮罩 */}
      {isLoading && !error && (
        <div
          className="pet-placeholder"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span className="pet-emoji">⏳</span>
        </div>
      )}

      {/* 错误状态遮罩 */}
      {error && (
        <div
          className="pet-placeholder"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span className="pet-emoji">❌</span>
          <div style={{ fontSize: "12px", color: "#ff4444", marginTop: "8px" }}>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
