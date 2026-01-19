import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { GlassSurface } from './src/components/GlassSurface';
import { PetDisplay } from './src/components/PetDisplay';
import { ActionSidebar } from './src/components/ActionSidebar';
import { ChatInput } from './src/components/ChatInput';
import { PetStatusSidebar } from './src/components/PetStatusSidebar';
import { MessageHistory } from './src/components/MessageHistory';
import { GrowthStatus } from './src/components/GrowthStatus';
import { usePet } from './src/hooks/usePet';
import { AdoptionScreen } from './src/screens/AdoptionScreen';
import { StartScreen } from './src/screens/StartScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const { pet, currentUser, loading, login, logout, adoptPet, feed, play, chat, pet_touch } = usePet();
  const [hasEntered, setHasEntered] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'pet'; text: string }>>([]);

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

  // 4. 游戏主逻辑
  const handleSendMessage = async (message: string) => {
    const userMessage = { sender: 'user' as const, text: message };
    setMessages(prev => [...prev, userMessage]);

    const response = await chat(message);
    const petMessage = { sender: 'pet' as const, text: response };
    setMessages(prev => [...prev, petMessage]);
  };

  return (
    <View style={styles.container}>
      {/* 主内容区 - 宠物背景 */}
      <View style={styles.mainContent}>
        <PetDisplay pet={pet} />

        {/* 左侧悬浮状态栏 */}
        <PetStatusSidebar pet={pet} />

        {/* 悬浮顶部导航栏 - 毛玻璃效果 */}
        <View style={styles.floatingNavbar}>
          <GlassSurface style={styles.navGlass}>
            <View style={styles.navContent}>
              <TouchableOpacity style={styles.navButton} onPress={() => setShowHistory(true)}>
                <View style={styles.navIconCircle}>
                  <Text style={styles.navIcon}>💬</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navButton} onPress={() => setShowStatus(true)}>
                <View style={styles.navIconCircle}>
                  <Text style={styles.navIcon}>📊</Text>
                </View>
              </TouchableOpacity>

              {/* 退出登录按钮 (仅供开发/测试) */}
              <TouchableOpacity style={styles.navButton} onPress={logout}>
                <View style={[styles.navIconCircle, { backgroundColor: 'rgba(255, 59, 48, 0.3)' }]}>
                  <Text style={styles.navIcon}>🚪</Text>
                </View>
              </TouchableOpacity>
            </View>
          </GlassSurface>
        </View>

        {/* 右侧悬浮操作按钮 */}
        <ActionSidebar onFeed={feed} onPlay={play} onTouch={pet_touch} />
      </View>

      {/* 悬浮底部输入栏 */}
      <View style={styles.floatingInputContainer}>
        <ChatInput onSendMessage={handleSendMessage} />
      </View>


      {/* 消息历史弹窗 */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <MessageHistory messages={messages} onClose={() => setShowHistory(false)} />
      </Modal>

      {/* 成长状态弹窗 */}
      <Modal visible={showStatus} animationType="slide" transparent>
        <GrowthStatus pet={pet} onClose={() => setShowStatus(false)} />
      </Modal>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
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
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  floatingNavbar: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  navGlass: {
    borderRadius: 24,
  },
  navContent: {
    flexDirection: 'row',
    padding: 6,
    gap: 8,
  },
  navButton: {
    padding: 0,
  },
  navIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 22,
  },
  floatingInputContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 100,
  },
});

