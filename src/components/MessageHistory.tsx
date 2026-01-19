import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Message {
  sender: 'user' | 'pet';
  text: string;
}

interface MessageHistoryProps {
  messages: Message[];
  onClose: () => void;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({ messages, onClose }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>💬 消息记录</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messageList}>
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>还没有消息记录</Text>
          ) : (
            messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.petBubble
                ]}
              >
                <Text style={styles.messageText}>
                  {msg.sender === 'user' ? '我' : '宠物'}: {msg.text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
  },
  messageList: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
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
});
