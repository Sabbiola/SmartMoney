import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TransactionItem, Card } from '../../src/components';
import { useTransactionStore } from '../../src/store';
import { Transaction } from '../../src/types';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../../src/constants';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const groupedTransactions = groupByDate(filteredTransactions);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currencySymbol = CURRENCY_SYMBOLS[DEFAULT_CURRENCY];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transazioni</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={24} color={colors.gray700} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Entrate</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              +{currencySymbol}{totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spese</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              -{currencySymbol}{totalExpenses.toFixed(2)}
            </Text>
          </View>
        </Card>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab
          label="Tutte"
          isActive={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterTab
          label="Entrate"
          isActive={filter === 'income'}
          onPress={() => setFilter('income')}
        />
        <FilterTab
          label="Spese"
          isActive={filter === 'expense'}
          onPress={() => setFilter('expense')}
        />
      </View>

      {/* Transaction List */}
      <FlatList
        data={groupedTransactions}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{formatDateHeader(item.date)}</Text>
            <Card padding="none">
              {item.transactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                  {index < item.transactions.length - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Nessuna transazione</Text>
            <Text style={styles.emptySubtitle}>
              Le tue transazioni appariranno qui
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const FilterTab = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.filterTab, isActive && styles.filterTabActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const groupByDate = (transactions: Transaction[]) => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, transactions]) => ({ date, transactions }));
};

const formatDateHeader = (dateString: string) => {
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  summaryValue: {
    ...typography.h4,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.smallBold,
    color: colors.gray600,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeader: {
    ...typography.smallBold,
    color: colors.gray500,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  transactionDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray700,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
});
