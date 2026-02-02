import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../src/components';
import { useAuthStore } from '../../src/store';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'user', label: 'Modifica Profilo', onPress: () => {} },
        { icon: 'credit-card', label: 'Gestisci Conti', onPress: () => {} },
        { icon: 'tag', label: 'Categorie', onPress: () => {} },
      ],
    },
    {
      title: 'Preferenze',
      items: [
        { icon: 'bell', label: 'Notifiche', onPress: () => {} },
        { icon: 'globe', label: 'Lingua', value: 'Italiano', onPress: () => {} },
        { icon: 'dollar-sign', label: 'Valuta', value: 'EUR', onPress: () => {} },
        { icon: 'moon', label: 'Tema', value: 'Sistema', onPress: () => {} },
      ],
    },
    {
      title: 'Dati',
      items: [
        { icon: 'download', label: 'Esporta Dati', onPress: () => {} },
        { icon: 'upload', label: 'Importa Dati', onPress: () => {} },
        { icon: 'refresh-cw', label: 'Sincronizzazione', onPress: () => {} },
      ],
    },
    {
      title: 'Sicurezza',
      items: [
        { icon: 'lock', label: 'Cambia Password', onPress: () => {} },
        { icon: 'smartphone', label: 'Autenticazione Biometrica', onPress: () => {} },
        { icon: 'shield', label: 'PIN di Sicurezza', onPress: () => {} },
      ],
    },
    {
      title: 'Altro',
      items: [
        { icon: 'help-circle', label: 'Aiuto & FAQ', onPress: () => {} },
        { icon: 'mail', label: 'Contattaci', onPress: () => {} },
        { icon: 'star', label: 'Valuta l\'App', onPress: () => {} },
        { icon: 'info', label: 'Informazioni', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profilo</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileContainer}>
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Feather name="camera" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name || 'Utente'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@esempio.it'}</Text>
          </Card>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card padding="none">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Feather
                        name={item.icon as any}
                        size={20}
                        color={colors.gray600}
                      />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {(item as any).value && (
                      <Text style={styles.menuValue}>{(item as any).value}</Text>
                    )}
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={colors.gray400}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Esci</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>SmartMoney v1.0.0</Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
  },
  profileContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    ...typography.h3,
    color: colors.gray900,
  },
  userEmail: {
    ...typography.body,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.gray500,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    ...typography.body,
    color: colors.gray900,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    ...typography.body,
    color: colors.gray500,
    marginRight: spacing.sm,
  },
  logoutContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.gray400,
    textAlign: 'center',
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
