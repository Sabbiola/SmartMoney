import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../constants';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currency?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  currency = DEFAULT_CURRENCY,
}) => {
  const currencySymbol = CURRENCY_SYMBOLS[currency];
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Saldo Totale</Text>
        <Feather name="eye" size={20} color="rgba(255,255,255,0.7)" />
      </View>

      <Text style={styles.balance}>
        {currencySymbol}{totalBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Feather name="arrow-down-circle" size={16} color={colors.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Entrate</Text>
            <Text style={styles.statValue}>
              +{currencySymbol}{monthlyIncome.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Feather name="arrow-up-circle" size={16} color={colors.error} />
          </View>
          <View>
            <Text style={styles.statLabel}>Spese</Text>
            <Text style={styles.statValue}>
              -{currencySymbol}{monthlyExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.savingsRow}>
        <Text style={styles.savingsLabel}>Risparmio del mese</Text>
        <Text style={[styles.savingsValue, { color: savings >= 0 ? '#A5D6A7' : '#EF9A9A' }]}>
          {savings >= 0 ? '+' : ''}{currencySymbol}{savings.toFixed(2)} ({savingsRate.toFixed(0)}%)
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
  },
  balance: {
    ...typography.amountLarge,
    color: colors.white,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  statValue: {
    ...typography.smallBold,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  savingsLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
  },
  savingsValue: {
    ...typography.smallBold,
    fontVariant: ['tabular-nums'],
  },
});
