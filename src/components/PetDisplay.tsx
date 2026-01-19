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
});

