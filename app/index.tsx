
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAppState } from '../state/AppState';
import ActivityChart from '../components/ActivityChart';

export default function MainScreen() {
  const { accounts, totalBalance } = useAppState();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Prime</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>${totalBalance.toFixed(2)}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/transfer')}
            style={[styles.actionBtn, { backgroundColor: '#1e8e3e' }]}
            activeOpacity={0.8}
          >
            <Icon name="send" size={20} />
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/loan')}
            style={[styles.actionBtn, { backgroundColor: '#136ae4' }]}
            activeOpacity={0.8}
          >
            <Icon name="card" size={20} />
            <Text style={styles.actionText}>Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/calculator')}
            style={[styles.actionBtn, { backgroundColor: '#8a2be2' }]}
            activeOpacity={0.8}
          >
            <Icon name="calculator" size={20} />
            <Text style={styles.actionText}>Calculator</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        {accounts.map((a) => (
          <View key={a.id} style={styles.accountRow}>
            <View style={{ display: 'contents' }}>
              <Icon name="cash" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{a.name}</Text>
              <Text style={styles.accountNo}>{a.number}</Text>
            </View>
            <Text style={styles.accountAmt}>${a.balance.toFixed(2)}</Text>
          </View>
        ))}
        <Button text="Deposit" onPress={() => router.push('/transfer')} />
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <ActivityChart />
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/investments')} activeOpacity={0.9}>
          <Icon name="trending-up" size={26} />
          <Text style={styles.gridText}>Investments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/history')} activeOpacity={0.9}>
          <Icon name="time" size={26} />
          <Text style={styles.gridText}>History</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'web' ? (
        <View style={{ height: 30 }} />
      ) : (
        <View style={{ height: 10 }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  balanceCard: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  balanceLabel: {
    color: colors.text,
    opacity: 0.8,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
  },
  actionText: {
    color: '#fff',
    marginTop: 6,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomColor: '#234',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accountName: {
    color: colors.text,
    fontWeight: '600',
  },
  accountNo: {
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  accountAmt: {
    color: colors.text,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  gridText: {
    color: colors.text,
    fontWeight: '600',
  },
});
