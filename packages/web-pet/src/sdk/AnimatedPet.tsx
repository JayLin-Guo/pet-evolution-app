import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Pet } from "@pet-evolution/shared";
import { type Environment } from "./config";
import {
  usePetImageUrl,
  usePetAnimation,
  useGifAvailability,
  petAnimVariants,
  petGifAnimVariants,
  particleConfigs,
  type PetAnimState,
} from "./hooks/useAnimatedPet";
import "./AnimatedPet.css";

interface AnimatedPetProps {
  /** 宠物数据 */
  pet?: Pet;
  /** 环境标识 */
  environment?: Environment;
  /** 外部控制的动画状态 */
  animState?: PetAnimState;
}

/**
 * 粒子系统组件
 * 根据当前动画状态生成飘出的 emoji 粒子
 */
function ParticleSystem({ animState }: { animState: PetAnimState }) {
  const config = particleConfigs[animState];

  if (!config) return null;

  return (
    <div className="animated-pet-particles">
      <AnimatePresence>
        {Array.from({ length: config.count }).map((_, i) => {
          const emoji = config.emojis[i % config.emojis.length];
          // 随机化每个粒子的位置与轨迹
          const startX = 20 + Math.random() * 60; // 20%~80%
          const startY = 30 + Math.random() * 40; // 30%~70%
          const endX = startX + (Math.random() - 0.5) * 40;
          const endY = -10 - Math.random() * 30;
          const delay = i * 0.15;

          return (
            <motion.span
              key={`${animState}-${i}`}
              className="animated-pet-particle"
              style={{ left: `${startX}%`, top: `${startY}%` }}
              initial={{ scale: 0, opacity: 0, y: 0, x: 0 }}
              animate={{
                scale: [0, 1.2, 0.8],
                opacity: [0, 1, 0],
                y: [0, endY * 2],
                x: [0, (endX - startX) * 2],
              }}
              transition={{
                duration: 1.5,
                delay,
                repeat: animState === "idle" ? 0 : 1,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * PNG/GIF 动画宠物组件
 *
 * 双模式渲染：
 * 1. GIF 模式：用 GIF 展示角色自身的骨骼动画，配合轻微浮动 + 粒子特效
 * 2. PNG 模式（降级）：用静态 PNG + framer-motion 动画 + 粒子特效
 *
 * 组件会自动探测 GIF 是否可用，不可用时自动降级为 PNG 模式
 */
export function AnimatedPet({
  pet,
  environment,
  animState: externalAnimState,
}: AnimatedPetProps) {
  pet.petImageName = "mon_angry_dragon_03";
  // 计算图片 URL
  const { staticImageUrl, getGifUrl } = usePetImageUrl(pet, environment);

  // 内部动画状态（如果没有外部控制）
  const { animState: internalAnimState } = usePetAnimation("idle");

  // 使用外部状态优先
  const currentAnim = externalAnimState || internalAnimState;

  // 计算当前 GIF URL
  const currentGifUrl = useMemo(
    () => getGifUrl(currentAnim),
    [getGifUrl, currentAnim],
  );

  // 检测 idle GIF 是否可用（用于判断是否启用 GIF 模式）
  const idleGifUrl = useMemo(() => getGifUrl("idle"), [getGifUrl]);
  const gifAvailable = useGifAvailability(idleGifUrl);

  // 图片加载状态
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
    setImgError(false);
  }, []);

  const handleImgError = useCallback(() => {
    setImgLoaded(false);
    setImgError(true);
  }, []);

  // 根据 GIF 是否可用选择不同的 variants
  const currentVariants = useMemo(() => {
    const variants = gifAvailable ? petGifAnimVariants : petAnimVariants;
    return (variants[currentAnim] || variants.idle) as any;
  }, [currentAnim, gifAvailable]);

  // 决定实际使用的图片 URL
  const displayUrl = useMemo(() => {
    if (gifAvailable && currentGifUrl) {
      return currentGifUrl;
    }
    return staticImageUrl;
  }, [gifAvailable, currentGifUrl, staticImageUrl]);

  // 如果没有图片 URL，显示占位符
  if (!staticImageUrl) {
    return (
      <div className="animated-pet-placeholder">
        <span className="pet-emoji">🐲</span>
      </div>
    );
  }

  return (
    <div className="animated-pet-root">
      {/* 底部光晕 */}
      <div className={`animated-pet-glow glow-${currentAnim}`} />

      {/* 地面阴影 */}
      <div className="animated-pet-shadow" />

      {/* 宠物图片 - framer-motion 驱动 */}
      <motion.img
        key={displayUrl} // URL 变化时重新渲染，确保 GIF 从头播放
        src={displayUrl!}
        alt={pet?.name || "宠物"}
        className="animated-pet-img"
        draggable={false}
        onLoad={handleImgLoad}
        onError={handleImgError}
        animate={currentVariants}
        style={{
          display: imgError ? "none" : "block",
        }}
      />

      {/* 粒子系统 */}
      <ParticleSystem animState={currentAnim} />

      {/* 加载中 */}
      {!imgLoaded && !imgError && (
        <div className="animated-pet-loading">
          <span className="pet-emoji">⏳</span>
        </div>
      )}

      {/* 图片加载失败 - 降级到 PNG */}
      {imgError && staticImageUrl && (
        <motion.img
          src={staticImageUrl}
          alt={pet?.name || "宠物"}
          className="animated-pet-img"
          draggable={false}
          animate={
            (petAnimVariants[currentAnim] || petAnimVariants.idle) as any
          }
        />
      )}

      {/* 完全失败 */}
      {imgError && !staticImageUrl && (
        <div className="animated-pet-placeholder">
          <span className="pet-emoji">🐲</span>
        </div>
      )}
    </div>
  );
}
