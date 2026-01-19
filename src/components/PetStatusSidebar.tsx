import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Pet } from '../models/PetModel';
import { GlassSurface } from './GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

interface PetStatusSidebarProps {
  pet: Pet;
}

export const PetStatusSidebar: React.FC<PetStatusSidebarProps> = ({ pet }) => {
  const maxExp = pet.level * 100;
  const expProgress = (pet.exp / maxExp) * 100;

  const StatusItem = ({ 
    label, 
    value, 
    color, 
    icon 
  }: { 
    label: string, 
    value: number, 
    color: string, 
    icon: string 
  }) => (
    <View style={styles.statusItem}>
      <View style={styles.labelRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <View style={styles.barContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
          style={styles.barBg}
        />
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <GlassSurface style={styles.sidebarGlass} intensity={80}>
        <View style={styles.container}>
          {/* 等级头部 */}
          <View style={styles.header}>
            <Text style={styles.levelLabel}>LV</Text>
            <Text style={styles.levelValue}>{pet.level}</Text>
          </View>
          
          <View style={styles.divider} />

          {/* 状态列表 */}
          <StatusItem label="经验" value={expProgress} color="#FFD700" icon="✨" />
          <StatusItem label="饥饿" value={pet.hunger} color="#FF9500" icon="🍖" />
          <StatusItem label="快乐" value={pet.happiness} color="#FF2D55" icon="🎮" />
          <StatusItem label="健康" value={pet.health} color="#34C759" icon="❤️" />
        </View>
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    top: height * 0.2,
    width: 65,
    zIndex: 100,
    display: 'none'

  },
  sidebarGlass: {
    paddingVertical: 15,
    borderRadius: 32,
  },
  container: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: 'bold',
  },
  levelValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginTop: -4,
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 15,
  },
  statusItem: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 18,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 12,
    marginRight: 2,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.6)',
  },
  barContainer: {
    width: 45,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
