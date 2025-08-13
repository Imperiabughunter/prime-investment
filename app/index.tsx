
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../state/AppState';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { StyleSheet } from 'react-native';

export default function Dashboard() {
  const { state, user, loading, loadUserData } = useAppState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/signin');
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setError(null);
      await loadUserData();
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (error && state.investments.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalInvestments = state.investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpectedReturns = state.investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
  const activeLoans = state.loans.filter(loan => loan.status === 'approved').length;
  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <ErrorBoundary>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        {/* Quick Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Portfolio Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${totalInvestments.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Invested</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${totalExpectedReturns.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Expected Returns</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.investments.length}</Text>
              <Text style={styles.statLabel}>Investments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeLoans}</Text>
              <Text style={styles.statLabel}>Active Loans</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/investments')}
              activeOpacity={0.8}
            >
              <Icon name="trending-up" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Invest</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/loan')}
              activeOpacity={0.8}
            >
              <Icon name="card" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Loan</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/transfer')}
              activeOpacity={0.8}
            >
              <Icon name="swap-horizontal" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/calculator')}
              activeOpacity={0.8}
            >
              <Icon name="calculator" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Calculate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={commonStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.transactionAmount,
                    { color: transaction.amount >= 0 ? colors.success : colors.error }
                  ]}
                >
                  {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorBannerText}>Some data may be outdated</Text>
          </View>
        )}
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorBannerText: {
    marginLeft: 8,
    color: colors.error,
    fontSize: 14,
  },
});
