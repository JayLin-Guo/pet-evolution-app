import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionSidebarProps {
  onFeed: () => void;
  onPlay: () => void;
  onTouch: () => void;
}

export const ActionSidebar: React.FC<ActionSidebarProps> = ({ onFeed, onPlay, onTouch }) => {
  return (
    <View style={styles.floatingButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={onFeed}>
        <View style={[styles.iconCircle, { backgroundColor: '#FF9500' }]}>
          <Text style={styles.icon}>🍖</Text>
        </View>
        <Text style={styles.label}>喂食</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onPlay}>
        <View style={[styles.iconCircle, { backgroundColor: '#FF2D55' }]}>
          <Text style={styles.icon}>🎮</Text>
        </View>
        <Text style={styles.label}>玩耍</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onTouch}>
        <View style={[styles.iconCircle, { backgroundColor: '#AF52DE' }]}>
          <Text style={styles.icon}>💕</Text>
        </View>
        <Text style={styles.label}>抚摸</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtons: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    zIndex: 999,
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
