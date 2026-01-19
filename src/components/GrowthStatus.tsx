import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Pet, getStageName } from '../models/PetModel';
import { StatusBar } from './StatusBar';

interface GrowthStatusProps {
  pet: Pet;
  onClose: () => void;
}

export const GrowthStatus: React.FC<GrowthStatusProps> = ({ pet, onClose }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 成长状态</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            <Text style={styles.infoText}>名字: {pet.name}</Text>
            <Text style={styles.infoText}>等级: Lv.{pet.level}</Text>
            <Text style={styles.infoText}>阶段: {getStageName(pet.stage, pet.subStage)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>状态</Text>
            <StatusBar label="饥饿度" value={pet.hunger} color="#FF9500" />
            <StatusBar label="快乐度" value={pet.happiness} color="#FF2D55" />
            <StatusBar label="健康度" value={pet.health} color="#34C759" />
            <StatusBar label="亲密度" value={pet.intimacy} color="#AF52DE" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>属性</Text>
            <StatusBar label="力量" value={pet.attributes.strength} color="#FF6B35" />
            <StatusBar label="智力" value={pet.attributes.intelligence} color="#5856D6" />
            <StatusBar label="敏捷" value={pet.attributes.agility} color="#34C759" />
            <StatusBar label="精神" value={pet.attributes.spirit} color="#AF52DE" />
            <StatusBar label="魅力" value={pet.attributes.charm} color="#FF2D55" />
          </View>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});
