import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { GlassSurface } from '../components/GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';
import { Pet, GrowthStage } from '../models/PetModel';

const { width } = Dimensions.get('window');

interface StartScreenProps {
  pet: Pet;
  onEnter: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ pet, onEnter }) => {
  const getPetEmoji = () => {
    if (pet.stage === GrowthStage.BABY) return '🐣';
    if (pet.stage === GrowthStage.CHILD) return '🐱';
    if (pet.stage === GrowthStage.TEEN) return '🦊';
    if (pet.stage === GrowthStage.ADULT) return '🐯';
    if (pet.stage === GrowthStage.PRIME) return '🦁';
    return '🦄';
  };

  return (
    <LinearGradient colors={['#A8E6CF', '#87CEEB']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.petSection}>
          <Text style={styles.emoji}>{getPetEmoji()}</Text>
          <Text style={styles.welcomeText}>欢迎回来</Text>
          <Text style={styles.petName}>{pet.name}</Text>
        </View>

        <GlassSurface style={styles.glassInfo} intensity={70}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>等级</Text>
              <Text style={styles.infoValue}>Lv.{pet.level}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>亲密度</Text>
              <Text style={styles.infoValue}>{pet.intimacy}%</Text>
            </View>
          </View>
        </GlassSurface>

        <TouchableOpacity style={styles.enterButton} onPress={onEnter}>
          <LinearGradient
            colors={['#07C160', '#06AD56']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>进入世界</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
  },
  petName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  glassInfo: {
    width: width * 0.7,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 60,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  enterButton: {
    width: width * 0.6,
    height: 55,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#07C160',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
