import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  BalanceCard,
  Card,
  TransactionItem,
  GoalCard,
} from '../../src/components';
import { useTransactionStore, useBudgetStore, useAuthStore } from '../../src/store';
import { colors, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    transactions,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    fetchTransactions,
    fetchAccounts,
    isLoading,
  } = useTransactionStore();
  const { goals, fetchGoals } = useBudgetStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    await Promise.all([fetchTransactions(), fetchAccounts(), fetchGoals()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 5);
  const activeGoals = goals.filter((g) => !g.isCompleted).slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Utente'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Feather name="bell" size={24} color={colors.gray700} />
          </TouchableOpacity>
        </View>

        <BalanceCard
          totalBalance={totalBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="plus"
            label="Spesa"
            color={colors.expense}
            onPress={() => router.push('/(tabs)/add?type=expense')}
          />
          <QuickActionButton
            icon="download"
            label="Entrata"
            color={colors.income}
            onPress={() => router.push('/(tabs)/add?type=income')}
          />
          <QuickActionButton
            icon="repeat"
            label="Trasferisci"
            color={colors.secondary}
            onPress={() => router.push('/(tabs)/add?type=transfer')}
          />
          <QuickActionButton
            icon="target"
            label="Obiettivo"
            color={colors.accent}
            onPress={() => router.push('/(tabs)/budget')}
          />
        </View>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Obiettivi Attivi</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/budget')}>
                <Text style={styles.seeAll}>Vedi tutti</Text>
              </TouchableOpacity>
            </View>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transazioni Recenti</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>Vedi tutte</Text>
            </TouchableOpacity>
          </View>
          <Card padding="none">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                  {index < recentTransactions.length - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.gray300} />
                <Text style={styles.emptyText}>
                  Nessuna transazione ancora
                </Text>
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => router.push('/(tabs)/add')}
                >
                  <Text style={styles.addFirstText}>
                    Aggiungi la prima transazione
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickActionButton = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Feather name={icon as any} size={20} color={colors.white} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

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
  greeting: {
    ...typography.body,
    color: colors.gray600,
  },
  userName: {
    ...typography.h2,
    color: colors.gray900,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.caption,
    color: colors.gray700,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
  },
  seeAll: {
    ...typography.small,
    color: colors.primary,
  },
  transactionDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray500,
    marginTop: spacing.md,
  },
  addFirstButton: {
    marginTop: spacing.md,
  },
  addFirstText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
