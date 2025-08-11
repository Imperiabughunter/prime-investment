
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAppState } from '../state/AppState';
import Icon from '../components/Icon';
import TransactionItem from '../components/TransactionItem';
import FilterChips from '../components/FilterChips';
import { useMemo, useState } from 'react';
import { Transaction } from '../types';

export default function HistoryScreen() {
  const { transactions } = useAppState();
  const [type, setType] = useState<'all' | Transaction['type']>('all');
  const [month, setMonth] = useState<number | 'all'>('all');

  const months = useMemo(() => {
    const set = new Set<number>();
    transactions.forEach((t) => set.add(new Date(t.date).getMonth()));
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr;
  }, [transactions]);

  const filtered = transactions.filter((t) => {
    const byType = type === 'all' || t.type === type;
    const byMonth = month === 'all' || new Date(t.date).getMonth() === month;
    return byType && byMonth;
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <FilterChips
          label="Type"
          options={[
            { key: 'all', label: 'All' },
            { key: 'investment', label: 'Investment' },
            { key: 'loan', label: 'Loan' },
            { key: 'transfer', label: 'Transfer' },
            { key: 'deposit', label: 'Deposit' },
          ]}
          value={type}
          onChange={(v) => setType(v as any)}
        />
        <FilterChips
          label="Month"
          options={[{ key: 'all', label: 'All' }].concat(
            months.map((m) => ({ key: String(m), label: new Date(2020, m, 1).toLocaleString(undefined, { month: 'short' }) }))
          )}
          value={month === 'all' ? 'all' : String(month)}
          onChange={(v) => setMonth(v === 'all' ? 'all' : parseInt(v, 10))}
        />
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Results</Text>
        {filtered.length === 0 ? (
          <Text style={styles.text}>No transactions found for the selected filters.</Text>
        ) : (
          filtered.map((t) => <TransactionItem key={t.id} tx={t} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { backgroundColor: '#24314a', padding: 8, borderRadius: 10 },
  title: { color: colors.text, fontWeight: '700', fontSize: 20 },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10 },
  text: { color: colors.text },
});
