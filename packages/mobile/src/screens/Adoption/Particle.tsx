import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export const Particle = React.memo(() => {
  const anim = useRef(new Animated.Value(0)).current;
  const config = useRef({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    scale: Math.random() * 0.5 + 0.5,
    duration: 3000 + Math.random() * 2000,
    delay: Math.random() * 2000,
  }).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: config.duration / 2,
          delay: config.delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: config.duration / 2,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 0],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: config.top as any,
        left: config.left as any,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#FFD700",
        opacity: opacity,
        transform: [{ translateY }, { scale: config.scale }],
      }}
    />
  );
});
