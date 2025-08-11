
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../state/AppState';
import { Icon } from '../components/Icon';
import { ActivityChart } from '../components/ActivityChart';

export default function MainScreen() {
  const { state, user, loading, loadUserData } = useAppState();

  useEffect(() => {
    if (user && !loading) {
      loadUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.welcomeTitle}>Welcome to Natively</Text>
        <Text style={styles.welcomeSubtitle}>
          Your personal finance companion
        </Text>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/signin')}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeInvestments = state.investments.filter(inv => inv.status === 'active').length;
  const pendingLoans = state.loans.filter(loan => loan.status === 'pending').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome back, {user.profile?.display_name || 'User'}!
        </Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>
        <Text style={styles.balanceLabel}>Total Balance</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeInvestments}</Text>
          <Text style={styles.statLabel}>Active Investments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingLoans}</Text>
          <Text style={styles.statLabel}>Pending Loans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{state.transactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Activity Overview</Text>
        <ActivityChart transactions={state.transactions} />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/investments')}
          >
            <Icon name="trending-up" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Investments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/loan')}
          >
            <Icon name="dollar-sign" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/transfer')}
          >
            <Icon name="send" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/calculator')}
          >
            <Icon name="calculator" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Calculator</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {state.transactions.slice(0, 3).map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDesc}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                transaction.amount > 0 ? styles.positive : styles.negative,
              ]}
            >
              ${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => router.push('/history')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All Transactions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionsContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  recentContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    marginBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  viewAllButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
