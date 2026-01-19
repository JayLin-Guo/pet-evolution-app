import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { GlassSurface } from '../components/GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AdoptionScreenProps {
  onAdopt: (name: string) => void;
}

export const AdoptionScreen: React.FC<AdoptionScreenProps> = ({ onAdopt }) => {
  const [name, setName] = useState('');

  const handleAdopt = () => {
    if (name.trim()) {
      onAdopt(name.trim());
    }
  };

  return (
    <LinearGradient colors={['#87CEEB', '#E0F6FF']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <GlassSurface style={styles.glass} intensity={90}>
          <View style={styles.content}>
            <Text style={styles.title}>领养新宠物</Text>
            
            <View style={styles.petPreview}>
              <Text style={styles.babyEmoji}>🐣</Text>
              <Text style={styles.petLabel}>发现了一枚待孵化的蛋！</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>给它取个名字吧</Text>
              <TextInput
                style={styles.input}
                placeholder="输入宠物姓名..."
                value={name}
                onChangeText={setName}
                placeholderTextColor="rgba(0,0,0,0.3)"
              />
            </View>

            <TouchableOpacity
              style={[styles.adoptButton, !name.trim() && styles.disabledButton]}
              onPress={handleAdopt}
              disabled={!name.trim()}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>开始我们的旅程</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassSurface>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glass: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 30,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  petPreview: {
    alignItems: 'center',
    marginBottom: 40,
  },
  babyEmoji: {
    fontSize: 100,
    marginBottom: 10,
  },
  petLabel: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  adoptButton: {
    width: '100%',
    height: 55,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
