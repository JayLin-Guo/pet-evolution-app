import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLogin, useLoginAnimations } from "./useLogin";
import { styles } from "./styles";

interface LoginScreenProps {
  onLogin: (
    phone: string,
    captchaId: string,
    captchaCode: string,
  ) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const {
    phone,
    setPhone,
    verifyCode,
    setVerifyCode,
    loading,
    captchaSvg,
    refreshCaptcha,
    handleLogin,
  } = useLogin();

  const { fadeAnim, slideAnim, floatingAnim, floatingInterpolate } =
    useLoginAnimations();

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
          <Text style={styles.decorationText}>✨</Text>
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
          <Text style={styles.decorationText}>🌟</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingElement,
            styles.star3,
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
          <Text style={styles.decorationText}>💫</Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
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
          <Text style={styles.mainTitle}>🐲 宠物进化</Text>
          <Text style={styles.subtitle}>与你的专属伙伴一起成长冒险</Text>
        </Animated.View>

        {/* 输入区域 */}
        <Animated.View
          style={[
            styles.inputSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 手机号 */}
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

          {/* 图形验证码 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>图形验证码</Text>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="请输入验证码"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="number-pad"
                maxLength={4}
                value={verifyCode}
                onChangeText={setVerifyCode}
                selectionColor="rgba(255,255,255,0.8)"
                underlineColorAndroid="transparent"
                autoComplete="off"
                textContentType="none"
              />
              <TouchableOpacity
                onPress={refreshCaptcha}
                activeOpacity={0.7}
                style={styles.captchaButton}
              >
                {captchaSvg ? (
                  <Image
                    source={{
                      uri: `data:image/svg+xml;base64,${
                        typeof window !== "undefined" && window.btoa
                          ? window.btoa(
                              unescape(encodeURIComponent(captchaSvg)),
                            )
                          : ""
                      }`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator color="#667eea" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* 底部按钮 */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.loginButton,
              (phone.length !== 11 || verifyCode.length < 4 || loading) &&
                styles.disabledButton,
            ]}
            onPress={() => handleLogin(onLogin)}
            disabled={phone.length !== 11 || verifyCode.length < 4 || loading}
          >
            <LinearGradient
              colors={
                phone.length === 11 && verifyCode.length >= 4 && !loading
                  ? ["#ff6b6b", "#ee5a24"]
                  : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
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
