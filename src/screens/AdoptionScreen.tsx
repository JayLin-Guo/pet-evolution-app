import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AdoptionScreenProps {
  onAdopt: (name: string) => void;
}

export const AdoptionScreen: React.FC<AdoptionScreenProps> = ({ onAdopt }) => {
  const [name, setName] = useState('');
  
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const eggBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 启动动画序列
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

    // 蛋的弹跳动画
    const eggBounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(eggBounceAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(eggBounceAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    eggBounceAnimation.start();

    return () => {
      floatingAnimation.stop();
      eggBounceAnimation.stop();
    };
  }, []);

  const handleAdopt = () => {
    if (name.trim()) {
      onAdopt(name.trim());
    }
  };

  const floatingInterpolate = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* 背景装饰 */}
      <View style={styles.backgroundDecorations}>
        <Animated.View style={[styles.floatingElement, styles.heart1, {
          transform: [{ translateY: floatingInterpolate }]
        }]}>
          <Text style={styles.decorationText}>💕</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.heart2, {
          transform: [{ 
            translateY: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 6],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>💖</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.sparkle, {
          transform: [{ 
            translateX: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>✨</Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* 顶部标题区域 */}
        <Animated.View style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.mainTitle}>🥚 领养新宠物</Text>
          <Text style={styles.subtitle}>发现了一枚神秘的蛋，快来孵化它吧！</Text>
        </Animated.View>

        {/* 中间宠物预览区域 */}
        <Animated.View style={[
          styles.petSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Animated.View style={[
            styles.eggContainer,
            {
              transform: [{ scale: eggBounceAnim }]
            }
          ]}>
            <Text style={styles.eggEmoji}>🥚</Text>
            <View style={styles.eggGlow} />
          </Animated.View>
          <Text style={styles.eggDescription}>这枚蛋散发着神秘的光芒...</Text>
        </Animated.View>

        {/* 输入区域 */}
        <Animated.View style={[
          styles.inputSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>给它取个名字吧</Text>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="输入宠物姓名..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={name}
                onChangeText={setName}
                selectionColor="rgba(255,255,255,0.8)"
                underlineColorAndroid="transparent"
                autoComplete="name"
                textContentType="name"
              />
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
          <TouchableOpacity
            style={[
              styles.adoptButton, 
              !name.trim() && styles.disabledButton
            ]}
            onPress={handleAdopt}
            disabled={!name.trim()}
          >
            <LinearGradient
              colors={name.trim() 
                ? ['#ff6b6b', '#ee5a24'] 
                : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
              }
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🌟 开始我们的旅程</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
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
  heart1: {
    top: 120,
    left: 60,
  },
  heart2: {
    top: 180,
    right: 70,
  },
  sparkle: {
    top: 240,
    left: 80,
  },
  decorationText: {
    fontSize: 18,
    opacity: 0.3,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 60,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 22,
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  eggContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  eggEmoji: {
    fontSize: 120,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  eggGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  eggDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  nameInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
  },
  nameInput: {
    height: 52,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    outlineStyle: 'none',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  adoptButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
