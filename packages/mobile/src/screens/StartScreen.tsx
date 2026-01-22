import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pet, GrowthStage } from '@pet-evolution/shared';

interface StartScreenProps {
  pet: Pet;
  onEnter: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ pet, onEnter }) => {
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const petBounceAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 启动动画序列
    Animated.sequence([
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
      ]),
    ]).start();

    // 背景装饰浮动动画
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
      ])
    );
    floatingAnimation.start();

    // 宠物弹跳动画
    const petBounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(petBounceAnim, {
          toValue: 1.05,
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
      ])
    );
    petBounceAnimation.start();

    return () => {
      floatingAnimation.stop();
      petBounceAnimation.stop();
    };
  }, []);

  const getPetEmoji = () => {
    if (pet.stage === GrowthStage.BABY) return '🐣';
    if (pet.stage === GrowthStage.CHILD) return '🐱';
    if (pet.stage === GrowthStage.TEEN) return '🦊';
    if (pet.stage === GrowthStage.ADULT) return '🐯';
    if (pet.stage === GrowthStage.PRIME) return '🦁';
    return '🦄';
  };

  const floatingInterpolate = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* 背景装饰 */}
      <View style={styles.backgroundDecorations}>
        <Animated.View style={[styles.floatingElement, styles.star1, {
          transform: [{ translateY: floatingInterpolate }]
        }]}>
          <Text style={styles.decorationText}>🌟</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.star2, {
          transform: [{ 
            translateY: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 6],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>✨</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.heart, {
          transform: [{ 
            translateX: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>💖</Text>
        </Animated.View>
      </View>

      <View style={styles.inner}>
        {/* 顶部标题区域 */}
        <Animated.View style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.welcomeTitle}>🎉 欢迎回来</Text>
          <Text style={styles.subtitle}>你的伙伴正在等待你</Text>
        </Animated.View>

        {/* 中间宠物展示区域 */}
        <Animated.View style={[
          styles.petSection,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Animated.View style={[
            styles.petContainer,
            {
              transform: [{ scale: petBounceAnim }]
            }
          ]}>
            <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
            <View style={styles.petGlow} />
          </Animated.View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petStage}>
            {pet.stage === GrowthStage.BABY && '幼体阶段'}
            {pet.stage === GrowthStage.CHILD && '幼年阶段'}
            {pet.stage === GrowthStage.TEEN && '少年阶段'}
            {pet.stage === GrowthStage.ADULT && '成年阶段'}
            {pet.stage === GrowthStage.PRIME && '完全体阶段'}
          </Text>
        </Animated.View>

        {/* 宠物信息区域 */}
        <Animated.View style={[
          styles.infoSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>等级</Text>
              <Text style={styles.infoValue}>Lv.{pet.level}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>亲密度</Text>
              <Text style={styles.infoValue}>{pet.intimacy}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>经验值</Text>
              <Text style={styles.infoValue}>{pet.exp}</Text>
            </View>
          </View>
        </Animated.View>

        {/* 底部按钮区域 */}
        <Animated.View style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity style={styles.enterButton} onPress={onEnter}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a24']}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingElement: {
    position: 'absolute',
  },
  star1: {
    top: 100,
    left: 50,
  },
  star2: {
    top: 160,
    right: 70,
  },
  heart: {
    top: 220,
    left: 80,
  },
  decorationText: {
    fontSize: 18,
    opacity: 0.3,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  petSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  petContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  petEmoji: {
    fontSize: 100,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  petGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  petName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  petStage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  infoSection: {
    width: '100%',
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  enterButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
