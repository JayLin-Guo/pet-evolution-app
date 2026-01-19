import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginScreenProps {
  onLogin: (phone: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

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

    return () => {
      floatingAnimation.stop();
    };
  }, []);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (phone.length === 11) {
      setCountdown(60);
      // 这里可以调用发送验证码的API
    }
  };

  const handleLogin = async () => {
    if (phone.length === 11 && verifyCode.length >= 4) {
      setLoading(true);
      try {
        await onLogin(phone);
      } finally {
        setLoading(false);
      }
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
        <Animated.View style={[styles.floatingElement, styles.star1, {
          transform: [{ translateY: floatingInterpolate }]
        }]}>
          <Text style={styles.decorationText}>✨</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.star2, {
          transform: [{ 
            translateY: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 6],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>🌟</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingElement, styles.star3, {
          transform: [{ 
            translateX: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            })
          }]
        }]}>
          <Text style={styles.decorationText}>💫</Text>
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
          <Text style={styles.mainTitle}>🐲 宠物进化</Text>
          <Text style={styles.subtitle}>与你的专属伙伴一起成长冒险</Text>
        </Animated.View>

        {/* 中间输入区域 */}
        <Animated.View style={[
          styles.inputSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* 手机号输入 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>手机号</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+86</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="请输入手机号"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
                selectionColor="rgba(255,255,255,0.8)"
                underlineColorAndroid="transparent"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </View>
          </View>

          {/* 验证码输入 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>验证码</Text>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="请输入验证码"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="number-pad"
                maxLength={6}
                value={verifyCode}
                onChangeText={setVerifyCode}
                selectionColor="rgba(255,255,255,0.8)"
                underlineColorAndroid="transparent"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
              />
              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  (phone.length !== 11 || countdown > 0) && styles.disabledSendButton
                ]}
                onPress={handleSendCode}
                disabled={phone.length !== 11 || countdown > 0}
              >
                <Text style={styles.sendCodeText}>
                  {countdown > 0 ? `${countdown}s` : '发送'}
                </Text>
              </TouchableOpacity>
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
              styles.loginButton, 
              (phone.length !== 11 || verifyCode.length < 4 || loading) && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={phone.length !== 11 || verifyCode.length < 4 || loading}
          >
            <LinearGradient
              colors={phone.length === 11 && verifyCode.length >= 4 && !loading 
                ? ['#ff6b6b', '#ee5a24'] 
                : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
              }
              style={styles.buttonGradient}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>进入中...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🚀 进入世界</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.agreementText}>
            登录即表示同意《用户协议》与《隐私政策》
          </Text>
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
  star1: {
    top: 100,
    left: 50,
  },
  star2: {
    top: 160,
    right: 70,
  },
  star3: {
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
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 2,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
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
  },
  inputSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  phoneInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    outlineStyle: 'none', // Web平台去除outline
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingLeft: 16,
  },
  codeInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    outlineStyle: 'none', // Web平台去除outline
  },
  sendCodeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 8,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  sendCodeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
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
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  agreementText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
