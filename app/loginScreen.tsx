// app/loginScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    if (!username.trim()) return;
    await AsyncStorage.setItem('collectibles_username', username.trim());
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.replace('/(tabs)');
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🃏</Text>
          <Text style={styles.logoTitle}>COLLECTIBLES</Text>
          <Text style={styles.logoSub}>Tu colección. Tu mundo.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#4A5568"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#4A5568"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.loginButton, !username.trim() && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Entrar →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.footer}>Collectibles</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  bgCircle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF8A5C', opacity: 0.07, top: -80, right: -80 },
  bgCircle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#4A9EFF', opacity: 0.06, bottom: 100, left: -100 },
  bgCircle3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#6C5CE7', opacity: 0.08, top: 200, left: 30 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 60, marginBottom: 10 },
  logoTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 4, textShadowColor: '#FF8A5C', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  logoSub: { fontSize: 14, color: '#A0AEC0', marginTop: 6, letterSpacing: 1 },
  card: { backgroundColor: '#121826', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#2A3344', shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  label: { color: '#A0AEC0', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1F2A', borderRadius: 14, borderWidth: 1, borderColor: '#2A3344', paddingHorizontal: 14, paddingVertical: 4 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 14 },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  loginButton: { backgroundColor: '#FF8A5C', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28, shadowColor: '#FF8A5C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  loginButtonDisabled: { backgroundColor: '#3A2A20', shadowOpacity: 0 },
  loginButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  footer: { textAlign: 'center', color: '#2A3344', fontSize: 12, marginTop: 32 },
});