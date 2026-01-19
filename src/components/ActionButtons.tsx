import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onTouch: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onFeed, onPlay, onTouch }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={onFeed}>
        <Text style={styles.buttonText}>🍖 喂食</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.playButton]} onPress={onPlay}>
        <Text style={styles.buttonText}>🎮 玩耍</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.touchButton]} onPress={onTouch}>
        <Text style={styles.buttonText}>💕 抚摸</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  feedButton: {
    backgroundColor: '#FF9500',
  },
  playButton: {
    backgroundColor: '#FF2D55',
  },
  touchButton: {
    backgroundColor: '#AF52DE',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
