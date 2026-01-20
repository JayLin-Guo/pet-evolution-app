import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { usePet } from '@pet-evolution/shared';
import { AdoptionScreen } from './src/screens/AdoptionScreen';
import { StartScreen } from './src/screens/StartScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PetWebView } from './src/webview/PetWebView';

function getDevMachineHostIp(): string | null {
  // Expo 会在 DEV 下注入 debuggerHost，形如 "192.168.1.12:8085"
  // 在 release 下该字段通常不存在
  const maybe = (globalThis as any)?.__expo?.settings?.debuggerHost;
  if (typeof maybe !== 'string') return null;
  const host = maybe.split(':')[0];
  return host || null;
}

function resolveWebPetUrl(): string {
  // 1) 优先使用 env 显式配置（最稳）—— 注意 RN 下可能没有 process，需要先判断
  if (typeof process !== 'undefined' && (process as any).env) {
    const raw = (process as any).env.EXPO_PUBLIC_WEB_PET_URL;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }
  }

  // 2) DEV 下自动推导局域网 IP（避免真机访问 localhost 失败）
  const ip = getDevMachineHostIp();
  if (ip) return `http://${ip}:3000`;

  // 3) 兜底（模拟器上有时可用；真机大概率不可用）
  return 'http://localhost:3000';
}

/**
 * 从环境变量读取环境标识（test/product/dev）
 */
function resolveEnvironment(): "test" | "product" | "dev" | undefined {
  if (typeof process !== 'undefined' && (process as any).env) {
    const raw = (process as any).env.EXPO_PUBLIC_PET_ENVIRONMENT;
    if (typeof raw === 'string') {
      const env = raw.trim().toLowerCase();
      if (env === 'test' || env === 'product' || env === 'dev') {
        return env;
      }
    }
  }
  return 'test';
}

/**
 * 从环境变量读取资源后缀（如 "mon_earth_dragon_01_v38"）
 */
// NOTE: resourceSuffix 应由服务层/后端根据 pet 阶段/形态计算并下发（Pet.spineResourceSuffix）
// 这里不再从 env 读取，避免不同阶段资源无法动态切换

export default function App() {
  const { pet, currentUser, loading, login, logout, adoptPet, feed, play, chat, pet_touch } = usePet();
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
  const environment = resolveEnvironment();
  const resourceSuffix = pet.spineResourceSuffix;


  return (
    <View style={styles.container}>
     
      <PetWebView
        pet={pet}
        webUrl={webUrl}
        environment={environment}
        resourceSuffix={resourceSuffix}
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
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
});

