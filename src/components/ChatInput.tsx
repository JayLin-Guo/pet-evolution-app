import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GlassSurface } from './GlassSurface';

interface ChatInputProps {
  onSendMessage: (message: string, isVoice: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, false);
      setMessage('');
    }
  };

  const handleVoicePress = () => {
    setIsRecording(true);
  };

  const handleVoiceRelease = () => {
    setIsRecording(false);
    if (isRecording) {
      onSendMessage('语音消息', true);
    }
  };

  const toggleInputMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <GlassSurface style={styles.container}>
      <View style={styles.contentContainer}>
        {/* 左侧：语音/键盘切换按钮 */}
        <TouchableOpacity
          style={styles.modeButton}
          onPress={toggleInputMode}
          activeOpacity={0.6}
        >
          <View style={styles.iconWrapper}>
            <Text style={styles.modeIcon}>{isVoiceMode ? '⌨️' : '🎤'}</Text>
          </View>
        </TouchableOpacity>

        {/* 中间：输入框或语音按钮 */}
        <View style={styles.inputWrapper}>
          {isVoiceMode ? (
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              onPressIn={handleVoicePress}
              onPressOut={handleVoiceRelease}
              activeOpacity={1}
            >
              <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextActive]}>
                {isRecording ? '🔴 松开 结束' : '按住 说话'}
              </Text>
            </TouchableOpacity>
          ) : (
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
          )}
        </View>

        {/* 右侧：发送按钮或加号 */}
        {!isVoiceMode && message.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => {}}
            activeOpacity={0.6}
          >
            <View style={styles.iconWrapper}>
              <Text style={styles.plusIcon}>➕</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  modeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  modeIcon: {
    fontSize: 22,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 40,
    lineHeight: 22,
  },
  voiceButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.25)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  voiceButtonText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  voiceButtonTextActive: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#07C160',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
    shadowColor: '#07C160',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  plusButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 20,
  },
});
