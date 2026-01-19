import React from 'react';
import { Platform } from 'react-native';
import { Pet } from '@pet-evolution/shared';

// 根据平台导入不同的组件
const PetMainScreenWeb = Platform.OS === 'web' 
  ? require('./PetMainScreen.web').PetMainScreen 
  : null;

interface PetMainScreenProps {
  pet: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onTouch: () => void;
  onChat: (message: string) => Promise<string>;
  onShowHistory: () => void;
  onShowStatus: () => void;
  onLogout: () => void;
}

export const PetMainScreen: React.FC<PetMainScreenProps> = (props) => {
  // 在 Web 平台使用 Web 版本
  if (Platform.OS === 'web' && PetMainScreenWeb) {
    return <PetMainScreenWeb {...props} />;
  }

  // 在移动端，返回 null（由 App.tsx 处理原有逻辑）
  return null;
};
