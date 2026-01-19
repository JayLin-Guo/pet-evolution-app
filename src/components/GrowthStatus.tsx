import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pet, getStageName } from '../models/PetModel';
import { StatusBar } from './StatusBar';
import { Sheet } from './ios/Sheet';
import { Card } from './ios/Card';
import { ListItem } from './ios/ListItem';

interface GrowthStatusProps {
  pet: Pet;
  onClose: () => void;
}

export const GrowthStatus: React.FC<GrowthStatusProps> = ({ pet, onClose }) => {
  return (
    <Sheet visible={true} onClose={onClose} title="成长状态">
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📋 基本信息</Text>
        <ListItem title="名字" subtitle={pet.name} icon="🏷️" rightIcon="" />
        <ListItem title="等级" subtitle={`Lv.${pet.level}`} icon="⭐" rightIcon="" />
        <ListItem
          title="阶段"
          subtitle={getStageName(pet.stage, pet.subStage)}
          icon="🌱"
          rightIcon=""
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>💫 状态</Text>
        <View style={styles.statusList}>
          <StatusBar label="饥饿度" value={pet.hunger} color="#FF9500" />
          <StatusBar label="快乐度" value={pet.happiness} color="#FF2D55" />
          <StatusBar label="健康度" value={pet.health} color="#34C759" />
          <StatusBar label="亲密度" value={pet.intimacy} color="#AF52DE" />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ 属性</Text>
        <View style={styles.statusList}>
          <StatusBar label="力量" value={pet.attributes.strength} color="#FF6B35" />
          <StatusBar label="智力" value={pet.attributes.intelligence} color="#5856D6" />
          <StatusBar label="敏捷" value={pet.attributes.agility} color="#34C759" />
          <StatusBar label="精神" value={pet.attributes.spirit} color="#AF52DE" />
          <StatusBar label="魅力" value={pet.attributes.charm} color="#FF2D55" />
        </View>
      </Card>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  statusList: {
    gap: 8,
  },
});
