import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import type { PetResponseDto } from "@pet-evolution/shared";

import { getEnvironmentConfig, type Environment } from "../config";

/** 宠物动画状态 */
export type PetAnimState =
  | "idle"
  | "feed"
  | "play"
  | "touch"
  | "sleep"
  | "evolve";

/**
 * 动画状态 → GIF 文件名的映射
 * GIF 存放在 spine-role/{petImageName}/ 目录下
 * 目前先写死 idle1.gif 作为默认 GIF
 */
const ANIM_TO_GIF_NAME: Record<PetAnimState, string> = {
  idle: "idle1",
  feed: "idle1", // TODO: 导出 eat.gif 后改为 "eat"
  play: "idle1", // TODO: 导出 play.gif 后改为 "play"
  touch: "idle1", // TODO: 导出 touch.gif 后改为 "touch"
  sleep: "idle1", // TODO: 导出 sleep.gif 后改为 "sleep"
  evolve: "idle1",
};

/**
 * 获取默认环境
 */
function getDefaultEnv(): Environment {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "dev";
  }
  return "test";
}

/**
 * Hook: 计算宠物图片和 GIF URL
 *
 * GIF 路径：{staticBaseUrl}/{petImageName}/idle1.gif  (spine-role 目录)
 * PNG 路径：{petImgBaseUrl}/{petImageName}.png        (imgs 目录)
 */
export function usePetImageUrl(
  pet: PetResponseDto | undefined,
  environment: Environment = getDefaultEnv(),
) {
  return useMemo(() => {
    if (!pet?.resource_folder) {
      return {
        staticImageUrl: null,
        getGifUrl: () => null as string | null,
        imageName: null,
      };
    }

    const config = getEnvironmentConfig(environment);

    // PNG 来自 imgs 目录
    const imgBaseUrl = config.petImgBaseUrl.replace(/\/$/, "");
    const imageName = pet.resource_folder;
    const staticImageUrl = `${imgBaseUrl}/${imageName}.png`;

    // GIF 来自 spine-role 目录（通过 /api/static/ 路由）
    const staticBaseUrl = config.staticBaseUrl.replace(/\/$/, "");
    const getGifUrl = (animState: PetAnimState): string => {
      const gifName = ANIM_TO_GIF_NAME[animState] || "idle1";
      return `${staticBaseUrl}/${imageName}/${gifName}.gif`;
    };

    return { staticImageUrl, getGifUrl, imageName };
  }, [pet?.resource_folder, pet?.cultivation_level, environment]);
}

/**
 * Hook: 检测 GIF URL 是否可用
 * 用于降级：如果 GIF 不存在，则降回 PNG + CSS 动画
 */
export function useGifAvailability(gifUrl: string | null) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const checkedUrls = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!gifUrl) {
      setAvailable(false);
      return;
    }

    // 缓存检查结果
    if (checkedUrls.current.has(gifUrl)) {
      setAvailable(checkedUrls.current.get(gifUrl)!);
      return;
    }

    // 用 Image 探测 GIF 是否存在
    const img = new Image();
    img.onload = () => {
      checkedUrls.current.set(gifUrl, true);
      setAvailable(true);
    };
    img.onerror = () => {
      checkedUrls.current.set(gifUrl, false);
      setAvailable(false);
    };
    img.src = gifUrl;
  }, [gifUrl]);

  return available;
}

/**
 * Hook: 管理宠物动画状态（framer-motion 驱动）
 *
 * 提供：
 * - 当前动画状态 animState
 * - 触发临时动画（如喂食、玩耍）
 * - 动画自动回到 idle
 */
export function usePetAnimation(defaultState: PetAnimState = "idle") {
  const [animState, setAnimState] = useState<PetAnimState>(defaultState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 触发一次临时动画，在 duration 毫秒后自动回到 idle
   */
  const triggerAnim = useCallback((state: PetAnimState, duration = 2000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAnimState(state);

    timerRef.current = setTimeout(() => {
      setAnimState("idle");
      timerRef.current = null;
    }, duration);
  }, []);

  return { animState, setAnimState, triggerAnim };
}

/**
 * 各动画状态的 framer-motion variants 配置
 *
 * 当使用 GIF 时，transform 动画会减弱（因为 GIF 本身有动画），
 * 仅保留轻微的浮动效果，避免双重动画叠加。
 */
export const petAnimVariants = {
  idle: {
    y: [0, -10, 0],
    scale: [1, 1.02, 1],
    rotate: 0,
    transition: {
      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
  feed: {
    y: [0, -25, 0, -10, 0],
    scale: [1, 0.95, 1.1, 0.98, 1],
    rotate: 0,
    transition: {
      duration: 0.6,
      repeat: 3,
      ease: "easeOut",
    },
  },
  play: {
    y: [0, -30, 0, -30, 0],
    rotate: [0, -10, 0, 10, 0],
    scale: 1,
    transition: {
      duration: 0.8,
      repeat: 2,
      ease: "easeInOut",
    },
  },
  touch: {
    y: 0,
    rotate: [0, -6, 6, -6, 6, 0],
    scale: [1, 1.06, 1.06, 1.06, 1.06, 1],
    transition: {
      duration: 0.6,
      repeat: 3,
      ease: "easeInOut",
    },
  },
  sleep: {
    y: [0, -4, 0],
    scale: [1, 0.97, 1],
    rotate: [0, -2, 0],
    transition: {
      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  },
  evolve: {
    scale: [1, 1.2, 0.8, 1.3, 1],
    rotate: [0, 0, 0, 0, 0],
    y: [0, -20, 0, -20, 0],
    filter: [
      "brightness(1) drop-shadow(0 0 0px rgba(255,165,0,0))",
      "brightness(1.5) drop-shadow(0 0 30px rgba(255,165,0,0.8))",
      "brightness(1.2) drop-shadow(0 0 15px rgba(255,165,0,0.5))",
      "brightness(1.8) drop-shadow(0 0 40px rgba(255,215,0,1))",
      "brightness(1) drop-shadow(0 0 0px rgba(255,165,0,0))",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

/**
 * GIF 模式下的 framer-motion variants
 * 效果减弱，只保留轻微浮动，不与 GIF 自身动画冲突
 */
export const petGifAnimVariants = {
  idle: {
    y: [0, -6, 0],
    scale: 1,
    rotate: 0,
    transition: {
      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  },
  feed: {
    y: [0, -8, 0],
    scale: [1, 1.02, 1],
    rotate: 0,
    transition: {
      duration: 0.8,
      repeat: 2,
      ease: "easeOut",
    },
  },
  play: {
    y: [0, -12, 0],
    rotate: [0, -3, 3, 0],
    scale: 1,
    transition: {
      duration: 1,
      repeat: 1,
      ease: "easeInOut",
    },
  },
  touch: {
    y: 0,
    rotate: [0, -3, 3, 0],
    scale: [1, 1.03, 1.03, 1],
    transition: {
      duration: 0.8,
      repeat: 2,
      ease: "easeInOut",
    },
  },
  sleep: {
    y: [0, -3, 0],
    scale: 1,
    rotate: 0,
    transition: {
      y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
  evolve: {
    scale: [1, 1.15, 0.9, 1.2, 1],
    y: [0, -15, 0, -15, 0],
    filter: [
      "brightness(1) drop-shadow(0 0 0px rgba(255,165,0,0))",
      "brightness(1.4) drop-shadow(0 0 25px rgba(255,165,0,0.8))",
      "brightness(1.1) drop-shadow(0 0 10px rgba(255,165,0,0.4))",
      "brightness(1.6) drop-shadow(0 0 35px rgba(255,215,0,1))",
      "brightness(1) drop-shadow(0 0 0px rgba(255,165,0,0))",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

/**
 * 各动画状态的粒子配置
 */
export const particleConfigs: Record<
  PetAnimState,
  { emojis: string[]; count: number } | null
> = {
  idle: null,
  feed: { emojis: ["🍖", "🍗", "⭐", "🍰", "✨"], count: 5 },
  play: { emojis: ["✨", "⭐", "💫", "🌟", "🎮"], count: 6 },
  touch: { emojis: ["💕", "❤️", "💗", "💖", "💝"], count: 5 },
  sleep: { emojis: ["💤", "😴", "💤"], count: 3 },
  evolve: { emojis: ["🔥", "✨", "⚡", "💎", "🌟"], count: 8 },
};
