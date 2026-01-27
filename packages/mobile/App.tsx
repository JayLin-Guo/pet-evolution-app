import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  AppState,
} from "react-native";
import { usePet } from "@pet-evolution/shared";
import { AdoptionScreen } from "./src/screens/AdoptionScreen";
import { StartScreen } from "./src/screens/StartScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PetWebView } from "./src/webview/PetWebView";

import { resolveEnvironment, resolveWebPetUrl } from "./src/utils/config";

export default function App() {
  const {
    pet,
    currentUser,
    loading,
    login,
    logout,
    adoptPet,
    feed,
    play,
    chat,
    pet_touch,
  } = usePet();
  const [hasEntered, setHasEntered] = useState(false);

  // 监听应用状态变化，从后台恢复时立即同步数据
  useEffect(() => {
    if (!currentUser) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // 应用从后台恢复，立即同步一次数据
        // usePet hook 中的轮询会自动处理，这里可以添加额外的同步逻辑
        console.log("[App] 应用恢复前台，触发数据同步");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>同步数据中...</Text>
      </View>
    );
  }

  // 1. 未登录状态：显示登录页面
  if (!currentUser) {
    return <LoginScreen onLogin={login} />;
  }

  // 2. 已登录但无宠物状态：显示领养页面
  if (!pet) {
    return <AdoptionScreen onAdopt={adoptPet} />;
  }

  // 3. 有宠物但未加入世界：显示前置进入页面
  if (!hasEntered) {
    return <StartScreen pet={pet} onEnter={() => setHasEntered(true)} />;
  }

  // 4. 游戏主逻辑：宠物主界面迁移到 web-pet，通过 WebView 嵌入
  // 开发期：建议将这里替换成局域网 IP（手机/模拟器能访问到的地址），或通过 EXPO_PUBLIC_WEB_PET_URL 配置
  const webUrl = resolveWebPetUrl();
  console.log("webUrl", webUrl);
  const environment = resolveEnvironment();

  return (
    <View style={styles.container}>
      <PetWebView
        pet={pet}
        webUrl={webUrl}
        environment={environment}
        onFeed={(foodValue) => feed(foodValue)}
        onPlay={play}
        onTouch={pet_touch}
        onChat={chat}
        onLogout={logout}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEEB",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
});
