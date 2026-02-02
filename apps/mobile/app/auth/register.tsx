import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/store';
import { colors, spacing, typography } from '../../src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non corrispondono');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Errore', 'La password deve essere di almeno 8 caratteri');
      return;
    }

    try {
      await register({ name, email, password });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Errore', err.message || 'Errore durante la registrazione');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={colors.gray900} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Crea Account</Text>
            <Text style={styles.subtitle}>
              Inizia a gestire i tuoi risparmi oggi
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome"
              placeholder="Mario Rossi"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              leftIcon="user"
            />

            <Input
              label="Email"
              placeholder="mario@esempio.it"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail"
            />

            <Input
              label="Password"
              placeholder="Minimo 8 caratteri"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              leftIcon="lock"
            />

            <Input
              label="Conferma Password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              leftIcon="lock"
            />

            <Button
              title="Registrati"
              onPress={handleRegister}
              loading={isLoading}
              size="large"
              style={styles.submitButton}
            />
          </View>

          <Text style={styles.terms}>
            Registrandoti accetti i nostri{' '}
            <Text style={styles.termsLink}>Termini di Servizio</Text> e la{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hai gia un account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Accedi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  terms: {
    ...typography.small,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  termsLink: {
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.gray600,
  },
  footerLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
