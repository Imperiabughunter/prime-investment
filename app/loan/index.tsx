
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAppState } from '../../state/AppState';
import Icon from '../../components/Icon';
import { useState } from 'react';

export default function LoanScreen() {
  const { applyForLoan, loans, approveLoan, accounts } = useAppState();
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('12');
  const [rate, setRate] = useState('0.12');
  const [accountId, setAccountId] = useState(accounts[0]?.id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Loan</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Apply for Loan</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor="#9ab"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Term (months)"
          placeholderTextColor="#9ab"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          value={rate}
          onChangeText={setRate}
          placeholder="Interest Rate (e.g., 0.12 for 12%)"
          placeholderTextColor="#9ab"
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <Text style={styles.text}>Disburse to:</Text>
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {accounts.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => setAccountId(a.id)}
                style={[styles.chip, accountId === a.id && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{a.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          onPress={() => {
            const amt = parseFloat(amount);
            const t = parseInt(term, 10);
            const r = parseFloat(rate);
            if (isNaN(amt) || amt <= 0) {
              Alert.alert('Invalid amount', 'Please enter a valid loan amount.');
              return;
            }
            if (isNaN(t) || t <= 0) {
              Alert.alert('Invalid term', 'Please enter a valid loan term (in months).');
              return;
            }
            if (isNaN(r) || r < 0) {
              Alert.alert('Invalid rate', 'Please enter a valid interest rate (e.g., 0.12 for 12%).');
              return;
            }
            const loan = applyForLoan(amt, t, r, accountId!);
            Alert.alert('Loan submitted', 'Loan is pending approval. You can simulate approval below.');
            console.log('Applied for loan', loan.id);
            setAmount('');
          }}
          style={styles.applyBtn}
          activeOpacity={0.85}
        >
          <Icon name="card" size={18} />
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Your Loans</Text>
        {loans.length === 0 ? (
          <Text style={styles.text}>No loans yet.</Text>
        ) : (
          loans.map((loan) => (
            <View key={loan.id} style={styles.loanItem}>
              <Text style={styles.text}>Amount: ${loan.amount.toFixed(2)}</Text>
              <Text style={styles.text}>Term: {loan.termMonths} months | Rate: {(loan.interestRate * 100).toFixed(1)}%</Text>
              <Text style={styles.text}>Status: {loan.status}</Text>
              {loan.status === 'pending' && (
                <TouchableOpacity
                  onPress={() => {
                    try {
                      approveLoan(loan.id);
                      Alert.alert('Loan approved', 'Funds have been credited to your selected account.');
                    } catch (e: any) {
                      Alert.alert('Approval failed', e.message || 'Unable to approve.');
                    }
                  }}
                  style={styles.approveBtn}
                  activeOpacity={0.85}
                >
                  <Icon name="checkmark" size={18} />
                  <Text style={styles.approveText}>Simulate Approval</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
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
  applyBtn: {
    marginTop: 12,
    backgroundColor: '#136ae4',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  applyText: { color: '#fff', fontWeight: '700' },
  loanItem: { marginBottom: 12, paddingBottom: 8, borderBottomColor: '#234', borderBottomWidth: StyleSheet.hairlineWidth },
  approveBtn: {
    marginTop: 8,
    backgroundColor: '#1e8e3e',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: { color: '#fff', fontWeight: '700' },
});
