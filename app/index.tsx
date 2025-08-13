
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../state/AppState';
import { colors } from '../styles/commonStyles';
import { StyleSheet } from 'react-native';

export default function MainScreen() {
  const { user, loading } = useAppState();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('MainScreen - user:', user, 'loading:', loading);
    
    // Initialize the app
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (isInitialized && !loading) {
      if (!user) {
        console.log('No user, redirecting to signin');
        router.replace('/signin');
      }
    }
  }, [user, loading, isInitialized]);

  if (!isInitialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {!isInitialized ? 'Initializing...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Redirecting to sign in...</Text>
      </View>
    );
  }

  // User is authenticated - show simple dashboard
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Prime Investment</Text>
      <Text style={styles.subtitle}>Hello, {user.email}!</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/investments')}
        >
          <Text style={styles.buttonText}>Investments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/loan')}
        >
          <Text style={styles.buttonText}>Loans</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/calculator')}
        >
          <Text style={styles.buttonText}>Calculator</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.debugButton]} 
          onPress={() => router.push('/debug')}
        >
          <Text style={styles.buttonText}>Debug</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  navButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: colors.warning,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
