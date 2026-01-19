import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 80,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* 模糊背景层 */}
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        {/* 半透明白色背景 */}
        <View style={styles.whiteOverlay} />
        
        {/* 对角线光泽渐变 */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.2)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glossGradient}
        />
        
        {/* 顶部高光 */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topHighlight}
        />
        
        {/* 底部阴影 */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomShadow}
        />
        
        {/* 内容 */}
        <View style={styles.content}>{children}</View>
      </BlurView>
      
      {/* 外边框高光 */}
      <View style={styles.borderHighlight} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  blur: {
    overflow: 'hidden',
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  glossGradient: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    pointerEvents: 'none',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    pointerEvents: 'none',
  },
  borderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
