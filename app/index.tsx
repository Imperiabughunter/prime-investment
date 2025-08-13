import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../state/AppState';
import { colors } from '../styles/commonStyles';
import { StyleSheet } from 'react-native';

export default function MainScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple initialization check
    const initializeApp = async () => {
      try {
        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        Alert.alert('Error', 'Failed to initialize app');
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { state, user, loading } = useAppState();

  useEffect(() => {
    console.log('AuthenticatedApp - user:', user, 'loading:', loading);

    if (!loading && !user) {
      console.log('No user found, redirecting to signin');
      router.replace('/signin');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  // User is authenticated, show dashboard
  return <Dashboard />;
}

function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Prime Investment</Text>
      <Text style={styles.subtitle}>Your dashboard is loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});