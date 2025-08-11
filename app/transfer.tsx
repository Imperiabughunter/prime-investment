
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAppState } from '../state/AppState';
import Icon from '../components/Icon';
import { useState } from 'react';

export default function TransferScreen() {
  const { accounts, transferBetweenAccounts, plans, investInPlan } = useAppState();
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState(accounts[0]?.id);
  const [to, setTo] = useState(accounts[1]?.id || accounts[0]?.id);
  const [toPlanId, setToPlanId] = useState<string | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Transfer / Invest</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>From Account</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {accounts.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => setFrom(a.id)}
              style={[styles.chip, from === a.id && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{a.name.split(' ')[0]} (${a.balance.toFixed(0)})</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>To</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {accounts.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => {
                setToPlanId(null);
                setTo(a.id);
              }}
              style={[styles.chip, to === a.id && !toPlanId && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{a.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
          {plans.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => {
                setToPlanId(p.id);
                setTo('');
              }}
              style={[styles.chip, toPlanId === p.id && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>Plan: {p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor="#9ab"
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => {
            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
              Alert.alert('Invalid amount', 'Please enter a valid amount.');
              return;
            }
            try {
              if (toPlanId) {
                investInPlan(toPlanId, amt, from!);
                Alert.alert('Investment successful', 'Your funds are locked for the duration.');
              } else if (to && from && to !== from) {
                transferBetweenAccounts(from!, to!, amt);
                Alert.alert('Transfer successful', 'Funds moved between accounts.');
              } else {
                Alert.alert('Invalid selection', 'Please select a different destination account or an investment plan.');
                return;
              }
              setAmount('');
            } catch (e: any) {
              Alert.alert('Operation failed', e.message || 'Please try again.');
            }
          }}
          style={styles.transferBtn}
          activeOpacity={0.85}
        >
          <Icon name="send" size={18} />
          <Text style={styles.transferText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.infoText}>Tip: Selecting a plan as destination will invest the amount directly from the chosen account.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { backgroundColor: '#24314a', padding: 8, borderRadius: 10 },
  title: { color: colors.text, fontWeight: '700', fontSize: 20 },
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
  transferBtn: {
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
  transferText: { color: '#fff', fontWeight: '700' },
  infoText: { color: colors.text, opacity: 0.9 },
});
