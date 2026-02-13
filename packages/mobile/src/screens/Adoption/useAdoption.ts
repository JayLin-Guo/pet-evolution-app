import { useState, useRef, useEffect } from "react";
import { Animated, Easing, Alert } from "react-native";

export const useAdoption = (
  onDraw: () => Promise<any>,
  onAdopt: (name: string, speciesId?: number) => void,
) => {
  const [stage, setStage] = useState<"idle" | "drawing" | "drawn">("idle");
  const [drawnEgg, setDrawnEgg] = useState<any>(null);
  const [name, setName] = useState("");
  const [redrawCount, setRedrawCount] = useState(3);

  const resultFadeAnim = useRef(new Animated.Value(0)).current;

  const handleStartDraw = async () => {
    if (redrawCount <= 0 && stage !== "idle") {
      Alert.alert("提示", "重抽次数已用完");
      return;
    }

    setStage("drawing");
    resultFadeAnim.setValue(0);

    try {
      const [res] = await Promise.all([
        onDraw(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      setDrawnEgg(res.petEgg);
      setStage("drawn");

      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.error(e);
      setStage("idle");
      Alert.alert("Error", "Failed to draw pet.");
    }
  };

  const handleRedraw = () => {
    if (redrawCount > 0) {
      setRedrawCount((prev) => prev - 1);
      handleStartDraw();
    }
  };

  const handleAdopt = () => {
    if (name.trim() && drawnEgg) {
      onAdopt(name.trim(), drawnEgg.species_id);
    }
  };

  return {
    stage,
    drawnEgg,
    name,
    setName,
    redrawCount,
    resultFadeAnim,
    handleStartDraw,
    handleRedraw,
    handleAdopt,
  };
};

export const useAdoptionAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const eggScaleAnim = useRef(new Animated.Value(1)).current;
  const eggRotateAnim = useRef(new Animated.Value(0)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.5)).current;
  const glowScaleAnim = useRef(new Animated.Value(1)).current;
  const holyLightAnim = useRef(new Animated.Value(0)).current;

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

  const spinInterpolate = eggRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return {
    fadeAnim,
    slideAnim,
    floatingAnim,
    eggScaleAnim,
    eggRotateAnim,
    glowOpacityAnim,
    glowScaleAnim,
    holyLightAnim,
    spinInterpolate,
  };
};

export const useEggStageAnimations = (
  stage: "idle" | "drawing" | "drawn",
  eggScaleAnim: Animated.Value,
  eggRotateAnim: Animated.Value,
  glowOpacityAnim: Animated.Value,
  glowScaleAnim: Animated.Value,
  holyLightAnim: Animated.Value,
) => {
  useEffect(() => {
    if (stage === "idle") {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(eggScaleAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(eggScaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowOpacityAnim, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacityAnim, {
              toValue: 0.4,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else if (stage === "drawing") {
      eggScaleAnim.setValue(1);
      const spin = Animated.loop(
        Animated.timing(eggRotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      const intenseGlow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowScaleAnim, {
            toValue: 1.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glowScaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
      const holyPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(holyLightAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(holyLightAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );

      spin.start();
      intenseGlow.start();
      holyPulse.start();
      return () => {
        spin.stop();
        intenseGlow.stop();
        holyPulse.stop();
      };
    }
  }, [stage]);
};
