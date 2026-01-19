import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Pet } from '../models/PetModel';
import { SpinePet } from './SpinePet';

interface PetDisplayProps {
  pet: Pet;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet }) => {
  // 临时固定使用 idle2 动画进行测试
  // idle2 是有完整动画数据的
  const currentAnimation = 'idle2';
  
  // TODO: 恢复动态动画逻辑（注意：attack1a 是空动画，不要使用）
  // 可用的动画：idle1, idle2, attack1b, attack1c, attack1d, attack1e, 
  //           attack2a, attack2b, catch, die, hitback, start
  // 空动画（不要使用）：attack1a
  //
  // const currentAnimation = useMemo(() => {
  //   if (pet.health < 20) return 'die';
  //   if (pet.hunger < 30) return 'attack1b';  // 改用 attack1b，不用 attack1a
  //   if (pet.happiness > 80) return 'attack1c';
  //   if (pet.happiness > 60) return 'idle1';
  //   return 'idle2';
  // }, [pet.hunger, pet.happiness, pet.health]);


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


