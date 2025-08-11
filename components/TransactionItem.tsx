
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { colors } from '../styles/commonStyles';

export default function TransactionItem({ tx }: { tx: Transaction }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.type, typeColor(tx.type)]}>{tx.type.toUpperCase()}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.desc}>{tx.description}</Text>
        <Text style={styles.meta}>{new Date(tx.date).toLocaleString()} • {tx.status}</Text>
      </View>
      <Text style={styles.amount}>{(tx.amount >= 0 ? '+' : '') + '$' + Math.abs(tx.amount).toFixed(2)}</Text>
    </View>
  );
}

function typeColor(type: Transaction['type']) {
  switch (type) {
    case 'loan':
      return { color: '#1e8e3e' };
    case 'investment':
      return { color: '#136ae4' };
    case 'transfer':
      return { color: '#8a2be2' };
    case 'deposit':
      return { color: '#f5a623' };
    default:
      return { color: colors.text };
  }
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomColor: '#234',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  type: { fontWeight: '700' },
  desc: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.text, opacity: 0.7, marginTop: 2 },
  amount: { color: colors.text, fontWeight: '700' },
});
