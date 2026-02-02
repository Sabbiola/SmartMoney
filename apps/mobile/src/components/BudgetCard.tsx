import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Budget } from '../types';
import { Card } from './Card';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../constants';

interface BudgetCardProps {
  budget: Budget;
  onPress?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress }) => {
  const percentUsed = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = remaining < 0;
  const currencySymbol = CURRENCY_SYMBOLS[DEFAULT_CURRENCY];

  const getProgressColor = () => {
    if (percentUsed >= 100) return colors.error;
    if (percentUsed >= 80) return colors.warning;
    return colors.primary;
  };

  const getStatusText = () => {
    if (isOverBudget) return `Superato di ${currencySymbol}${Math.abs(remaining).toFixed(2)}`;
    return `${currencySymbol}${remaining.toFixed(2)} rimanenti`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: budget.category?.color || colors.primary },
            ]}
          >
            <Feather
              name={(budget.category?.icon as any) || 'pie-chart'}
              size={20}
              color={colors.white}
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.name}>
              {budget.category?.name || 'Budget Totale'}
            </Text>
            <Text style={styles.period}>
              {budget.period === 'monthly' ? 'Mensile' : 'Settimanale'}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.spent}>
              {currencySymbol}{budget.spent.toFixed(2)}
            </Text>
            <Text style={styles.total}>
              / {currencySymbol}{budget.amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentUsed, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.statusText,
              { color: isOverBudget ? colors.error : colors.gray600 },
            ]}
          >
            {getStatusText()}
          </Text>
          <Text style={styles.percentText}>{percentUsed.toFixed(0)}%</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.gray900,
  },
  period: {
    ...typography.caption,
    color: colors.gray500,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  spent: {
    ...typography.bodyBold,
    color: colors.gray900,
    fontVariant: ['tabular-nums'],
  },
  total: {
    ...typography.caption,
    color: colors.gray500,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusText: {
    ...typography.small,
  },
  percentText: {
    ...typography.smallBold,
    color: colors.gray700,
  },
});
