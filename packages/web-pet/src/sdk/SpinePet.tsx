import { useState, useCallback } from "react";
import type { PetResponseDto } from "@pet-evolution/shared";
import { type Environment } from "./config";
import { useSpinePlayer, useSpineResources } from "./hooks/useSpine";

interface SpinePetProps {
  environment?: Environment;
  pet?: PetResponseDto;
}

export function SpinePet({
  environment = (() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "dev";
    }
    return "test";
  })(),
  pet,
}: SpinePetProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  const { jsonUrl, atlasUrl } = useSpineResources(pet, environment);
  const { isLoading, error } = useSpinePlayer(container, jsonUrl, atlasUrl);

  if (!jsonUrl) {
    return (
      <div className="pet-placeholder">
        <span className="pet-emoji">🐲</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

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
