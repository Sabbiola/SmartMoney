import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Feather name="dollar-sign" size={48} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>SmartMoney</Text>
          <Text style={styles.subtitle}>
            Gestisci i tuoi risparmi in modo intelligente
          </Text>

          <View style={styles.features}>
            <FeatureItem
              icon="pie-chart"
              text="Traccia le tue spese per categoria"
            />
            <FeatureItem
              icon="target"
              text="Imposta obiettivi di risparmio"
            />
            <FeatureItem
              icon="trending-up"
              text="Visualizza report dettagliati"
            />
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Accedi"
            onPress={() => router.push('/auth/login')}
            variant="secondary"
            size="large"
            style={styles.loginButton}
          />
          <Button
            title="Crea un account"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            size="large"
            style={styles.registerButton}
            textStyle={styles.registerButtonText}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Feather name={icon as any} size={20} color={colors.white} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginTop: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  buttons: {
    gap: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.white,
  },
  registerButton: {
    borderColor: colors.white,
  },
  registerButtonText: {
    color: colors.white,
  },
});
