import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sheet } from './ios/Sheet';
import { Card } from './ios/Card';

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
    <Sheet visible={true} onClose={onClose} title="消息记录">
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>还没有消息记录</Text>
          <Text style={styles.emptySubtext}>和宠物聊聊天吧</Text>
        </View>
      ) : (
        <View style={styles.messageList}>
          {messages.map((msg, index) => (
            <Card
              key={index}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.petBubble,
              ]}
            >
              <Text style={styles.senderLabel}>
                {msg.sender === 'user' ? '我' : '🐱 宠物'}
              </Text>
              <Text style={styles.messageText}>{msg.text}</Text>
            </Card>
          ))}
        </View>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
  },
  messageList: {
    gap: 12,
  },
  messageBubble: {
    padding: 12,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  petBubble: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  senderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
});
