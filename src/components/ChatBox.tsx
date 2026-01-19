import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface Message {
  sender: 'user' | 'pet';
  text: string;
}

interface ChatBoxProps {
  onSendMessage: (message: string) => string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      const userMessage: Message = { sender: 'user', text: inputText };
      setMessages(prev => [...prev, userMessage]);

      const response = onSendMessage(inputText);
      const petMessage: Message = { sender: 'pet', text: response };
      setMessages(prev => [...prev, petMessage]);

      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 聊天互动</Text>
      <ScrollView style={styles.messageList}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.petBubble
            ]}
          >
            <Text style={styles.messageText}>
              {msg.sender === 'user' ? '我: ' : '宠物: '}
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="说点什么..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageList: {
    height: 150,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-end',
  },
  petBubble: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
