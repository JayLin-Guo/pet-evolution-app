import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBarProps {
  label: string;
  value: number;
  color: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, value, color }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 70,
    fontSize: 14,
    color: '#333',
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  value: {
    width: 35,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});
