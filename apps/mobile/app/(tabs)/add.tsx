import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Input, Card } from '../../src/components';
import { useTransactionStore } from '../../src/store';
import { Category } from '../../src/types';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../src/constants';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function AddTransactionScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { addTransaction, categories, accounts, isLoading } = useTransactionStore();

  const [type, setType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString());

  const displayCategories =
    type === 'expense'
      ? DEFAULT_EXPENSE_CATEGORIES
      : DEFAULT_INCOME_CATEGORIES;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    if (!description) {
      Alert.alert('Errore', 'Inserisci una descrizione');
      return;
    }

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        categoryId: selectedCategory || 'default',
        accountId: selectedAccount || 'default',
        currency: 'EUR',
        date,
        notes: notes || undefined,
        isRecurring: false,
      });

      Alert.alert('Successo', 'Transazione aggiunta!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile aggiungere la transazione');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.gray700} />
          </TouchableOpacity>
          <Text style={styles.title}>Nuova Transazione</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Transaction Type Selector */}
          <View style={styles.typeSelector}>
            <TypeButton
              label="Spesa"
              icon="arrow-up-circle"
              isActive={type === 'expense'}
              color={colors.expense}
              onPress={() => setType('expense')}
            />
            <TypeButton
              label="Entrata"
              icon="arrow-down-circle"
              isActive={type === 'income'}
              color={colors.income}
              onPress={() => setType('income')}
            />
            <TypeButton
              label="Trasferimento"
              icon="repeat"
              isActive={type === 'transfer'}
              color={colors.secondary}
              onPress={() => setType('transfer')}
            />
          </View>

          {/* Amount Input */}
          <Card style={styles.amountCard}>
            <Text style={styles.amountLabel}>Importo</Text>
            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencySymbol, { color: type === 'expense' ? colors.expense : colors.income }]}>
                {type === 'expense' ? '-' : '+'}
              </Text>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                containerStyle={styles.amountInputWrapper}
              />
            </View>
          </Card>

          {/* Description */}
          <Input
            label="Descrizione"
            placeholder="Es: Pranzo, Stipendio..."
            value={description}
            onChangeText={setDescription}
            leftIcon="edit-3"
          />

          {/* Category Selector */}
          {type !== 'transfer' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {displayCategories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.name && styles.categoryItemSelected,
                      selectedCategory === category.name && { borderColor: category.color },
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color },
                      ]}
                    >
                      <Feather
                        name={category.icon as any}
                        size={18}
                        color={colors.white}
                      />
                    </View>
                    <Text
                      style={styles.categoryName}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          <Input
            label="Note (opzionale)"
            placeholder="Aggiungi dettagli..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            leftIcon="file-text"
          />

          {/* Submit Button */}
          <Button
            title={type === 'expense' ? 'Aggiungi Spesa' : type === 'income' ? 'Aggiungi Entrata' : 'Trasferisci'}
            onPress={handleSubmit}
            loading={isLoading}
            size="large"
            style={[
              styles.submitButton,
              { backgroundColor: type === 'expense' ? colors.expense : type === 'income' ? colors.income : colors.secondary },
            ]}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TypeButton = ({
  label,
  icon,
  isActive,
  color,
  onPress,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.typeButton,
      isActive && { backgroundColor: color, borderColor: color },
    ]}
    onPress={onPress}
  >
    <Feather
      name={icon as any}
      size={20}
      color={isActive ? colors.white : colors.gray600}
    />
    <Text style={[styles.typeButtonText, isActive && { color: colors.white }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h4,
    color: colors.gray900,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    gap: spacing.xs,
  },
  typeButtonText: {
    ...typography.smallBold,
    color: colors.gray600,
  },
  amountCard: {
    marginBottom: spacing.md,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    ...typography.amountLarge,
    marginRight: spacing.sm,
  },
  amountInput: {
    ...typography.amountLarge,
  },
  amountInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '31%',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    borderWidth: 2,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.caption,
    color: colors.gray700,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
