import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputProps {
  onSendMessage: (message: string, isVoice: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
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
    onSendMessage('语音消息', true);
  };

  return (
    <View style={styles.container}>
      {/* 语音按钮 */}
      <TouchableOpacity
        style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
        onPressIn={handleVoicePress}
        onPressOut={handleVoiceRelease}
        activeOpacity={0.8}
      >
        <Text style={styles.voiceIcon}>{isRecording ? '🔴' : '🎤'}</Text>
      </TouchableOpacity>

      {/* 输入框 */}
      <TextInput
        style={styles.input}
        placeholder="说点什么..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline
      />

      {/* 发送按钮 */}
      {message.trim() ? (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.sendButtonPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  voiceButtonActive: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  voiceIcon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  sendButtonPlaceholder: {
    width: 44,
    height: 44,
  },
});
