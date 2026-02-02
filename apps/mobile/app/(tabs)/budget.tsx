import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BudgetCard, GoalCard, Card, Button, Input } from '../../src/components';
import { useBudgetStore } from '../../src/store';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../../src/constants';

type TabType = 'budgets' | 'goals';

export default function BudgetScreen() {
  const {
    budgets,
    goals,
    fetchBudgets,
    fetchGoals,
    addGoal,
    contributeToGoal,
    isLoading,
  } = useBudgetStore();

  const [activeTab, setActiveTab] = useState<TabType>('goals');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);

  // New goal form
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');

  // Contribution form
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    fetchBudgets();
    fetchGoals();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBudgets(), fetchGoals()]);
    setRefreshing(false);
  };

  const handleAddGoal = async () => {
    if (!goalName || !goalAmount) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    try {
      await addGoal({
        name: goalName,
        targetAmount: parseFloat(goalAmount),
        targetDate: goalDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        color: colors.primary,
        priority: 1,
      });
      setShowAddGoal(false);
      setGoalName('');
      setGoalAmount('');
      setGoalDate('');
      Alert.alert('Successo', 'Obiettivo creato!');
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount || !showContribute) return;

    try {
      await contributeToGoal(showContribute, parseFloat(contributionAmount));
      setShowContribute(null);
      setContributionAmount('');
      Alert.alert('Successo', 'Contributo aggiunto!');
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const currencySymbol = CURRENCY_SYMBOLS[DEFAULT_CURRENCY];

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget & Obiettivi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddGoal(true)}
        >
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Totale Risparmiato</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {currencySymbol}{totalSaved.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Obiettivo Totale</Text>
              <Text style={styles.summaryValue}>
                {currencySymbol}{totalTarget.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalTarget > 0
              ? `${((totalSaved / totalTarget) * 100).toFixed(0)}% completato`
              : 'Nessun obiettivo'}
          </Text>
        </Card>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
          onPress={() => setActiveTab('goals')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'goals' && styles.tabTextActive,
            ]}
          >
            Obiettivi ({goals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budgets' && styles.tabActive]}
          onPress={() => setActiveTab('budgets')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'budgets' && styles.tabTextActive,
            ]}
          >
            Budget ({budgets.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'goals' ? (
          <>
            {activeGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>In Corso</Text>
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onPress={() => setShowContribute(goal.id)}
                  />
                ))}
              </View>
            )}

            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completati</Text>
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </View>
            )}

            {goals.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="target" size={64} color={colors.gray300} />
                <Text style={styles.emptyTitle}>Nessun obiettivo</Text>
                <Text style={styles.emptySubtitle}>
                  Crea il tuo primo obiettivo di risparmio
                </Text>
                <Button
                  title="Crea Obiettivo"
                  onPress={() => setShowAddGoal(true)}
                  style={styles.emptyButton}
                />
              </View>
            )}
          </>
        ) : (
          <>
            {budgets.length > 0 ? (
              budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="pie-chart" size={64} color={colors.gray300} />
                <Text style={styles.emptyTitle}>Nessun budget</Text>
                <Text style={styles.emptySubtitle}>
                  Imposta un budget per le tue spese
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuovo Obiettivo</Text>
              <TouchableOpacity onPress={() => setShowAddGoal(false)}>
                <Feather name="x" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <Input
              label="Nome obiettivo"
              placeholder="Es: Vacanza estiva"
              value={goalName}
              onChangeText={setGoalName}
            />

            <Input
              label="Importo target"
              placeholder="1000"
              value={goalAmount}
              onChangeText={setGoalAmount}
              keyboardType="decimal-pad"
            />

            <Button
              title="Crea Obiettivo"
              onPress={handleAddGoal}
              loading={isLoading}
            />
          </View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal visible={!!showContribute} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aggiungi Contributo</Text>
              <TouchableOpacity onPress={() => setShowContribute(null)}>
                <Feather name="x" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <Input
              label="Importo"
              placeholder="100"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="decimal-pad"
            />

            <Button
              title="Aggiungi"
              onPress={handleContribute}
              loading={isLoading}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  addButton: {
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
  summaryCard: {},
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.gray900,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodyBold,
    color: colors.gray600,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.gray500,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
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
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
});
