import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { usePet } from "@pet-evolution/shared";
import { AdoptionScreen } from "./src/screens/AdoptionScreen";
import { StartScreen } from "./src/screens/StartScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PetWebView } from "./src/webview/PetWebView";

function getDevMachineHostIp(): string | null {
  // Expo 会在 DEV 下注入 debuggerHost，形如 "192.168.1.12:8085"
  // 在 release 下该字段通常不存在
  const maybe = (globalThis as any)?.__expo?.settings?.debuggerHost;
  if (typeof maybe !== "string") return null;
  const host = maybe.split(":")[0];
  return host || null;
}

function resolveWebPetUrl(): string {
  // 开发环境：使用本地服务 (优先使用 IP 以支持真机调试)
  if (__DEV__) {
    const ip = getDevMachineHostIp();
    return ip ? `http://${ip}:3000` : "http://localhost:3000";
  }

  // 生产/构建环境：指向线上 H5 地址
  return "http://47.93.247.175:8081";
}

/**
 * 从环境变量读取环境标识（test/product/dev）
 */
function resolveEnvironment(): "test" | "product" | "dev" | undefined {
  if (typeof process !== "undefined" && (process as any).env) {
    const raw = (process as any).env.EXPO_PUBLIC_PET_ENVIRONMENT;
    if (typeof raw === "string") {
      const env = raw.trim().toLowerCase();
      if (env === "test" || env === "product" || env === "dev") {
        return env;
      }
    }
  }
  return "test";
}

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
