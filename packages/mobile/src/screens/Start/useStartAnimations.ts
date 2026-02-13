import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

export const useStartAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const petBounceAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // 新增特效动画
  const glowPulseAnim = useRef(new Animated.Value(0)).current;
  const levelShimmerAnim = useRef(new Animated.Value(0)).current;
  const auraPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();

    // 宠物呼吸弹跳
    const petBounce = Animated.loop(
      Animated.sequence([
        Animated.timing(petBounceAnim, {
          toValue: 1.06,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(petBounceAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    petBounce.start();

    // 发光脉冲（底部光 + 境界发光）
    const glowPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowPulse.start();

    // 境界徽章闪光扫过
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(levelShimmerAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(levelShimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();

    // 光环脉冲
    const auraPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraPulseAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    auraPulse.start();

    return () => {
      petBounce.stop();
      glowPulse.stop();
      shimmer.stop();
      auraPulse.stop();
    };
  }, []);

  return {
    fadeAnim,
    slideAnim,
    petBounceAnim,
    scaleAnim,
    glowPulseAnim,
    levelShimmerAnim,
    auraPulseAnim,
  };
};
