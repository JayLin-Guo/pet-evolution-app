import { useState, useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import { authApi } from "../../api/auth";

export const useLogin = () => {
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState<string | null>(null);
  const [captchaId, setCaptchaId] = useState<string>("");

  const refreshCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();
      setCaptchaId(res.captchaId);
      setCaptchaSvg(res.svg);
      setVerifyCode("");
    } catch (e) {
      console.error("Failed to get captcha", e);
    }
  };

  const handleLogin = async (
    onLogin: (
      phone: string,
      captchaId: string,
      captchaCode: string,
    ) => Promise<void>,
  ) => {
    if (phone.length === 11 && verifyCode.length >= 4) {
      setLoading(true);
      try {
        await onLogin(phone, captchaId, verifyCode);
      } finally {
        setLoading(false);
        refreshCaptcha();
      }
    }
  };

  return {
    phone,
    setPhone,
    verifyCode,
    setVerifyCode,
    loading,
    captchaSvg,
    captchaId,
    refreshCaptcha,
    handleLogin,
  };
};

export const useLoginAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    ]).start();

    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatingAnimation.start();

    return () => {
      floatingAnimation.stop();
    };
  }, []);

  const floatingInterpolate = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return { fadeAnim, slideAnim, floatingAnim, floatingInterpolate };
};
