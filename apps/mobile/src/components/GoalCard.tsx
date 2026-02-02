import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SavingsGoal } from '../types';
import { Card } from './Card';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../constants';

interface GoalCardProps {
  goal: SavingsGoal;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const currencySymbol = CURRENCY_SYMBOLS[DEFAULT_CURRENCY];
  const remaining = goal.targetAmount - goal.currentAmount;

  const getDaysRemaining = () => {
    const target = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, { backgroundColor: goal.color || colors.primary }]}
          >
            <Feather name="target" size={20} color={colors.white} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.name}>{goal.name}</Text>
            <Text style={styles.daysRemaining}>
              {goal.isCompleted
                ? 'Completato!'
                : `${daysRemaining} giorni rimanenti`}
            </Text>
          </View>
          {goal.isCompleted && (
            <View style={styles.completedBadge}>
              <Feather name="check" size={16} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: goal.color || colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>

        <View style={styles.amounts}>
          <View>
            <Text style={styles.amountLabel}>Risparmiato</Text>
            <Text style={[styles.amountValue, { color: goal.color || colors.primary }]}>
              {currencySymbol}{goal.currentAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.amountRight}>
            <Text style={styles.amountLabel}>Obiettivo</Text>
            <Text style={styles.amountValue}>
              {currencySymbol}{goal.targetAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {!goal.isCompleted && remaining > 0 && (
          <Text style={styles.remainingText}>
            Mancano {currencySymbol}{remaining.toFixed(2)} al traguardo
          </Text>
        )}
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.h4,
    color: colors.gray900,
  },
  daysRemaining: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.smallBold,
    color: colors.gray700,
    marginLeft: spacing.sm,
    width: 40,
    textAlign: 'right',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  amountValue: {
    ...typography.bodyBold,
    color: colors.gray900,
    fontVariant: ['tabular-nums'],
  },
  remainingText: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
