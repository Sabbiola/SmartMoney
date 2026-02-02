import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Transaction } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../constants';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? colors.expense : colors.income;
  const amountPrefix = isExpense ? '-' : '+';
  const currencySymbol = CURRENCY_SYMBOLS[transaction.currency || DEFAULT_CURRENCY];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    if (transaction.category?.icon) {
      return transaction.category.icon as keyof typeof Feather.glyphMap;
    }
    return isExpense ? 'shopping-bag' : 'dollar-sign';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: transaction.category?.color || colors.gray200 },
        ]}
      >
        <Feather
          name={getCategoryIcon()}
          size={20}
          color={colors.white}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.category}>
          {transaction.category?.name || 'Senza categoria'} - {formatDate(transaction.date)}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}{currencySymbol}{transaction.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.gray900,
  },
  category: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
  },
  amount: {
    ...typography.bodyBold,
    fontVariant: ['tabular-nums'],
  },
});
