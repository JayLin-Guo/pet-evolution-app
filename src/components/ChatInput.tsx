import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { GlassSurface } from './GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 动画值
  const hudOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleInputMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  // 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsRecording(true);
        setIsCancelling(false);
        // 显示 HUD
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }),
          Animated.timing(hudOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // 向上滑动超过 80 触发取消状态
        if (gestureState.dy < -80) {
          if (!isCancelling) setIsCancelling(true);
        } else {
          if (isCancelling) setIsCancelling(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldCancel = gestureState.dy < -80;
        
        // 隐藏 HUD 并缩放回来
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
          Animated.timing(hudOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
          setIsRecording(false);
          if (!shouldCancel) {
            onSendMessage('语音消息');
          }
        });
      },
      onPanResponderTerminate: () => {
        setIsRecording(false);
        hudOpacity.setValue(0);
        buttonScale.setValue(1);
      },
    })
  ).current;

  return (
    <View>
      {/* 微信同款居中提示框 (HUD) */}
      <Animated.View 
        style={[
          styles.hudWrapper, 
          { opacity: hudOpacity, transform: [{ scale: hudOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }
        ]}
        pointerEvents="none"
      >
        <GlassSurface style={styles.hudGlass} intensity={100}>
          <View style={[styles.hudContent, isCancelling && styles.hudContentCancel]}>
            {isCancelling ? (
              <>
                <Text style={styles.hudIcon}>↩️</Text>
                <Text style={[styles.hudText, styles.hudTextCancel]}>松开手指，取消发送</Text>
              </>
            ) : (
              <>
                <View style={styles.voiceWaveContainer}>
                  <View style={[styles.waveBar, { height: 20 }]} />
                  <View style={[styles.waveBar, { height: 35 }]} />
                  <View style={[styles.waveBar, { height: 25 }]} />
                  <View style={[styles.waveBar, { height: 40 }]} />
                  <View style={[styles.waveBar, { height: 20 }]} />
                </View>
                <Text style={styles.hudText}>正在录音...</Text>
              </>
            )}
          </View>
        </GlassSurface>
      </Animated.View>

      {/* 底部输入栏 */}
      <GlassSurface style={styles.container} intensity={90}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.modeButton}
            onPress={toggleInputMode}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <LinearGradient
                colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 17 }]}
              />
              <Text style={styles.modeIcon}>{isVoiceMode ? '⌨️' : '🎤'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            {isVoiceMode ? (
              <Animated.View 
                style={[
                  styles.voiceButtonContainer, 
                  { transform: [{ scale: buttonScale }] }
                ]}
                {...panResponder.panHandlers}
              >
                <View style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}>
                  <LinearGradient
                    colors={isRecording ? 
                      ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)'] : 
                      ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                  />
                  <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextActive]}>
                    {isRecording ? (isCancelling ? '松开手指，取消发送' : '松开 结束') : '按住 说话'}
                  </Text>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.textInputContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
                />
                <TextInput
                  style={styles.input}
                  placeholder="和宠物说点什么..."
                  placeholderTextColor="rgba(0, 0, 0, 0.35)"
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  multiline
                />
              </View>
            )}
          </View>

          {!isVoiceMode && message.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#07C160', '#06AD56']}
                style={[StyleSheet.absoluteFill, { borderRadius: 17 }]}
              />
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 17 }]}
                />
                <Text style={styles.plusIcon}>➕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  // HUD 样式 (居中悬浮)
  hudWrapper: {
    position: 'absolute',
    bottom: 250, // 至于输入框上方
    left: (SCREEN_WIDTH - 200) / 2 - 16, // 居中校准 (考虑父容器 padding)
    width: 200,
    zIndex: 999,
  },
  hudGlass: {
    borderRadius: 20,
    height: SCREEN_WIDTH * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hudContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hudContentCancel: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  hudIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  hudText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  hudTextCancel: {
    color: '#FF3B30',
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
    marginBottom: 10,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#07C160',
    borderRadius: 2,
  },

  // 输入栏样式
  container: {
    borderRadius: 24,
    paddingHorizontal: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 8,
  },
  modeButton: {
    width: 36,
    height: 36,
    marginBottom: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  modeIcon: {
    fontSize: 18,
  },
  inputWrapper: {
    flex: 1,
  },
  voiceButtonContainer: {
    height: 40,
  },
  voiceButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  voiceButtonActive: {
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  voiceButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  voiceButtonTextActive: {
    color: '#000',
  },
  textInputContainer: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    overflow: 'hidden',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  plusButton: {
    width: 36,
    height: 36,
    marginBottom: 2,
  },
  plusIcon: {
    fontSize: 18,
  },
});



