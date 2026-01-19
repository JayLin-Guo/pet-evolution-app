import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { GlassSurface } from '../components/GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin: (phone: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length === 11) {
      setLoading(true);
      try {
        await onLogin(phone);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <LinearGradient colors={['#6A11CB', '#2575FC']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <GlassSurface style={styles.glass} intensity={80}>
          <View style={styles.content}>
            <Text style={styles.logo}>🐾</Text>
            <Text style={styles.title}>宠物进化</Text>
            <Text style={styles.subtitle}>在这里开启你的第二人生</Text>

            <View style={styles.inputContainer}>
              <View style={styles.phoneInputRow}>
                <Text style={styles.countryCode}>+86</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                (phone.length !== 11 || loading) && styles.disabledButton
              ]}
              onPress={handleLogin}
              disabled={phone.length !== 11 || loading}
            >
              <LinearGradient
                colors={['#00C6FF', '#0072FF']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>进入世界</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.terms}>登录即表示同意《用户协议》与《隐私政策》</Text>
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
    padding: 30,
    borderRadius: 32,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  countryCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 55,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#00C6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
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
    letterSpacing: 1,
  },
  terms: {
    marginTop: 20,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
