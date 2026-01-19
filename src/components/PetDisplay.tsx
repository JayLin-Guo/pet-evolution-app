import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Pet } from '../models/PetModel';
import { SpinePet } from './SpinePet';

interface PetDisplayProps {
  pet: Pet;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet }) => {
  // 根据宠物的数值状态动态决定 Spine 的动作（Animation）
  // 针对 Earth Dragon 素材进行适配：主要待动作为 idle2
  const currentAnimation = useMemo(() => {
    if (pet.hunger < 30) return 'attack1a'; // 饥饿时表现出攻击性/不安
    if (pet.happiness > 80) return 'attack1c'; // 开心时执行一段华丽的动作
    return 'idle2'; // 默认待机状态
  }, [pet.hunger, pet.happiness]);


  return (
    <View style={styles.container}>
      <View style={styles.petPlatform}>
        {/* 这里使用了我们新创建的 Spine 渲染器 */}
        <SpinePet 
          pet={pet} 
          animation={currentAnimation} 
        />
        
        {/* 底部阴影效果 */}
        <View style={styles.shadow} />
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
  petPlatform: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    width: 120,
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 60,
    marginTop: -20,
    transform: [{ scaleX: 1.5 }],
  },
});


