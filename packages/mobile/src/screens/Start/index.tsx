import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PetResponseDto } from "@pet-evolution/shared";
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
    floatingAnim,
    petBounceAnim,
    scaleAnim,
    floatingInterpolate,
  } = useStartAnimations();

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      {/* 背景装饰 */}
      <View style={styles.backgroundDecorations}>
        <Animated.View
          style={[
            styles.floatingElement,
            styles.star1,
            { transform: [{ translateY: floatingInterpolate }] },
          ]}
        >
          <Text style={styles.decorationText}>🌟</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingElement,
            styles.star2,
            {
              transform: [
                {
                  translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 6],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.decorationText}>✨</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingElement,
            styles.heart,
            {
              transform: [
                {
                  translateX: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.decorationText}>💖</Text>
        </Animated.View>
      </View>

      <View style={styles.inner}>
        {/* 标题 */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>🎉 欢迎回来</Text>
          <Text style={styles.subtitle}>你的伙伴正在等待你</Text>
        </Animated.View>

        {/* 宠物展示 */}
        <Animated.View
          style={[
            styles.petSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.petContainer,
              { transform: [{ scale: petBounceAnim }] },
            ]}
          >
            <Text style={styles.petEmoji}>🐲</Text>
            <View style={styles.petGlow} />
          </Animated.View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petLevel}>{pet.cultivation_level}</Text>
        </Animated.View>

        {/* 宠物信息 */}
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>亲密度</Text>
              <Text style={styles.infoValue}>{pet.intimacy}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>快乐</Text>
              <Text style={styles.infoValue}>{pet.happiness}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>健康</Text>
              <Text style={styles.infoValue}>{pet.health}%</Text>
            </View>
          </View>
        </Animated.View>

        {/* 进入按钮 */}
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
              colors={["#ff6b6b", "#ee5a24"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🚀 进入世界</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};
