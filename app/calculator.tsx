
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAppState } from '../state/AppState';
import Icon from '../components/Icon';
import { useMemo, useState } from 'react';

export default function CalculatorScreen() {
  const { plans, estimatePlanReturn } = useAppState();
  const [planId, setPlanId] = useState(plans[0]?.id);
  const plan = useMemo(() => plans.find((p) => p.id === planId), [planId, plans]);
  const [amount, setAmount] = useState('1000');

  const calc = plan ? estimatePlanReturn(plan, parseFloat(amount) || 0) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Investment Calculator</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Select Plan</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {plans.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPlanId(p.id)}
              style={[styles.chip, planId === p.id && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor="#9ab"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Results</Text>
        {calc && plan ? (
          <>
            <Text style={styles.text}>Duration: {plan.durationDays} days</Text>
            <Text style={styles.text}>ROI: {(plan.roi * 100).toFixed(1)}%</Text>
            <Text style={styles.text}>Compounding: {plan.compoundingRate} times</Text>
            <Text style={styles.text}>Expected Return: ${calc.expectedReturn.toFixed(2)}</Text>
            <Text style={styles.text}>Maturity Amount: ${(calc.expectedReturn + (parseFloat(amount) || 0)).toFixed(2)}</Text>
          </>
        ) : (
          <Text style={styles.text}>Please select a plan and enter a valid amount.</Text>
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
  text: { color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: '#0e1420',
    borderColor: '#2d3a57',
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    padding: 12,
    marginTop: 6,
  },
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
});
