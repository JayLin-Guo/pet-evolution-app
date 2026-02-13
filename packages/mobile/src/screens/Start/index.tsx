import React from "react";
import { View, Text, TouchableOpacity, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PetResponseDto } from "@pet-evolution/shared";
import { resolveWebPetUrl, resolveApiUrl } from "../../utils/config";
import { Particle } from "../Adoption/Particle";
import { useStartAnimations } from "./useStartAnimations";
import { styles } from "./styles";

interface StartScreenProps {
  pet: PetResponseDto;
  onEnter: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ pet, onEnter }) => {
  const {
    fadeAnim,
    slideAnim,
    petBounceAnim,
    scaleAnim,
    glowPulseAnim,
    levelShimmerAnim,
    auraPulseAnim,
  } = useStartAnimations();

  const getPetGifUrl = (): string | null => {
    if (!pet.resource_folder) return null;
    const folder = pet.resource_folder.startsWith("/")
      ? pet.resource_folder.substring(1)
      : pet.resource_folder;

    // 统一使用远程静态资源服务器
    const staticBaseUrl = "http://47.93.247.175:8081/static";
    return `${staticBaseUrl}/spine-role/${folder}/idle2.gif`;
  };

  const gifUrl = getPetGifUrl();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/pet-draw-bc.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.backgroundDecorations}>
        {[...Array(30)].map((_, i) => (
          <Particle key={i} />
        ))}
      </View>

      <View style={styles.inner}>
        {/* 顶部：境界徽章 */}
        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.levelBadgeWrapper}>
            <Animated.View
              style={[
                styles.levelGlow,
                {
                  opacity: glowPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0.9],
                  }),
                  transform: [
                    {
                      scale: glowPulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1.08],
                      }),
                    },
                  ],
                },
              ]}
            />
            <LinearGradient
              colors={["rgba(255,180,50,0.85)", "rgba(255,120,20,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.levelBadge}
            >
              <Text style={styles.levelIcon}>⚡</Text>
              <Text style={styles.levelText}>{pet.cultivation_level}</Text>
            </LinearGradient>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [
                    {
                      translateX: levelShimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-120, 120],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* 中间：宠物展示 */}
        <Animated.View
          style={[
            styles.petSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* 外圈脉冲光环 */}
          <Animated.View
            style={[
              styles.auraRingOuter,
              {
                opacity: auraPulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
                transform: [
                  {
                    scale: auraPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.0, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.auraRingInner,
              {
                opacity: auraPulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 0.45],
                }),
                transform: [
                  {
                    scale: auraPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.05],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* 底部发光 */}
          <Animated.View
            style={[
              styles.bottomGlow,
              {
                opacity: glowPulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
                transform: [
                  {
                    scaleX: glowPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* 宠物 */}
          <Animated.View
            style={[
              styles.petContainer,
              { transform: [{ scale: petBounceAnim }] },
            ]}
          >
            {gifUrl ? (
              <Image
                source={{ uri: gifUrl }}
                style={styles.petImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.petEmoji}>🐲</Text>
            )}
          </Animated.View>

          <Text style={styles.petName}>{pet.name}</Text>
        </Animated.View>

        {/* 底部：进入按钮 */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.enterButton} onPress={onEnter}>
            <LinearGradient
              colors={["#F2994A", "#F2C94C"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🚀 进入世界</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};
