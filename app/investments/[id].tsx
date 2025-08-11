
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../../state/AppState';
import { colors, commonStyles } from '../../styles/commonStyles';
import ProgressBar from '../../components/ProgressBar';
import Icon from '../../components/Icon';

export default function PlanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, investments, accounts, investInPlan, estimatePlanReturn } = useAppState();
  const plan = useMemo(() => plans.find((p) => p.id === id), [plans, id]);
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id);
  const [expected, setExpected] = useState(0);

  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    if (plan && amt > 0) {
      setExpected(estimatePlanReturn(plan, amt).expectedReturn);
    } else {
      setExpected(0);
    }
  }, [amount, plan, estimatePlanReturn]);

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text }}>Plan not found</Text>
      </View>
    );
  }

  const myInvestments = investments.filter((inv) => inv.planId === plan.id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>{plan.name}</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.text}>Min: ${plan.minAmount.toLocaleString()} | Max: ${plan.maxAmount.toLocaleString()}</Text>
        <Text style={styles.text}>ROI: {(plan.roi * 100).toFixed(1)}% | Compounding: {plan.compoundingRate}x</Text>
        <Text style={styles.text}>Duration: {plan.durationDays} days</Text>
        <Text style={[styles.text, { marginTop: 6 }]}>{plan.description}</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Invest</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor="#9ab"
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.accountsRow}>
          <Text style={styles.text}>From account:</Text>
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {accounts.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => setSelectedAccountId(a.id)}
                style={[styles.chip, selectedAccountId === a.id && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{a.name.split(' ')[0]} (${a.balance.toFixed(0)})</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Text style={styles.expectedText}>Expected Return: ${expected.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => {
            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
              Alert.alert('Invalid amount', 'Please enter a valid investment amount.');
              return;
            }
            try {
              investInPlan(plan.id, amt, selectedAccountId!);
              Alert.alert('Investment successful', 'Your funds are locked for the duration.');
              setAmount('');
            } catch (e: any) {
              Alert.alert('Investment failed', e.message || 'Unable to invest. Please try again.');
            }
          }}
          style={styles.investBtn}
          activeOpacity={0.85}
        >
          <Icon name="trending-up" size={18} />
          <Text style={styles.investText}>Invest</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Your Investments in this Plan</Text>
        {myInvestments.length === 0 ? (
          <Text style={styles.text}>No investments yet.</Text>
        ) : (
          myInvestments.map((inv) => {
            const now = Date.now();
            const total = new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime();
            const elapsed = Math.min(Math.max(now - new Date(inv.startDate).getTime(), 0), total);
            const progress = total > 0 ? elapsed / total : 0;
            return (
              <View key={inv.id} style={styles.invItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.text}>Amount: ${inv.amount.toFixed(2)}</Text>
                  <Text style={styles.text}>
                    Expected: ${(inv.expectedReturn + inv.amount).toFixed(2)}
                  </Text>
                </View>
                <ProgressBar progress={progress} />
                <Text style={[styles.text, { opacity: 0.8 }]}>
                  {Math.round(progress * 100)}% complete | Matures on {new Date(inv.endDate).toDateString()}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { backgroundColor: '#24314a', padding: 8, borderRadius: 10 },
  title: { color: colors.text, fontWeight: '700', fontSize: 20 },
  text: { color: colors.text, marginBottom: 6 },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10 },
  input: {
    backgroundColor: '#0e1420',
    borderColor: '#2d3a57',
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    padding: 12,
    marginTop: 6,
  },
  accountsRow: { marginTop: 10, gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2d3a57',
    backgroundColor: '#162133',
  },
  chipActive: { backgroundColor: '#2753d9' },
  chipText: { color: '#fff', fontWeight: '600' },
  expectedText: { color: colors.text, fontWeight: '600', marginTop: 8 },
  investBtn: {
    marginTop: 12,
    backgroundColor: '#1e8e3e',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  investText: { color: '#fff', fontWeight: '700' },
  invItem: { marginBottom: 10 },
});
