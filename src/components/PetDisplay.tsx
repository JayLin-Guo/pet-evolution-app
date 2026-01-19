import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Pet, GrowthStage, getStageName } from '../models/PetModel';

interface PetDisplayProps {
  pet: Pet;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet }) => {
  const breathAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 呼吸动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 眨眼动画
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(blink, Math.random() * 3000 + 2000);
      });
    };
    blink();

    // 轻微漂浮动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getPetEmoji = () => {
    if (pet.stage === GrowthStage.BABY) return '🐣';
    if (pet.stage === GrowthStage.CHILD) return '🐱';
    if (pet.stage === GrowthStage.TEEN) return '🦊';
    if (pet.stage === GrowthStage.ADULT) return '🐯';
    if (pet.stage === GrowthStage.PRIME) return '🦁';
    if (pet.stage === GrowthStage.PEAK) {
      if (pet.ultimateForm === 'dragon') return '🐉';
      if (pet.ultimateForm === 'taotie') return '👹';
      if (pet.ultimateForm === 'angel') return '👼';
      if (pet.ultimateForm === 'phoenix') return '🦅';
      if (pet.ultimateForm === 'qilin') return '🦄';
    }
    return '🐱';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.petContainer,
          {
            transform: [
              { scale: breathAnim },
              { translateY: floatAnim }
            ],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.petEmoji,
            { opacity: blinkAnim },
          ]}
        >
          {getPetEmoji()}
        </Animated.Text>
      </Animated.View>

      {/* 等级标签 */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Lv.{pet.level}</Text>
      </View>

      {/* 经验条 */}
      <View style={styles.expContainer}>
        <View style={styles.expBar}>
          <View
            style={[
              styles.expFill,
              { width: `${(pet.exp / (pet.level * 100)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.expText}>
          {pet.exp}/{pet.level * 100}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: {
    fontSize: 150,
  },
  levelBadge: {
    position: 'absolute',
    top: 100,
    right: 50,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  levelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expContainer: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
    alignItems: 'center',
  },
  expBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  expFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  expText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
