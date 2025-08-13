import React from 'react';
import { Stack } from 'expo-router';
import { AppStateProvider } from '../state/AppState';
import { setupErrorLogging } from '../utils/errorLogger';
import ErrorBoundary from '../components/ErrorBoundary';

// Setup error logging
setupErrorLogging();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signin" options={{ title: 'Sign In', headerShown: true }} />
          <Stack.Screen name="(auth)/signup" options={{ title: 'Sign Up', headerShown: true }} />
          <Stack.Screen name="signin" options={{ title: 'Sign In', headerShown: true }} />
          <Stack.Screen name="signup" options={{ title: 'Sign Up', headerShown: true }} />
          <Stack.Screen name="calculator" options={{ title: 'Calculator', headerShown: true }} />
          <Stack.Screen name="history" options={{ title: 'History', headerShown: true }} />
          <Stack.Screen name="transfer" options={{ title: 'Transfer', headerShown: true }} />
          <Stack.Screen name="investments/index" options={{ title: 'Investments', headerShown: true }} />
          <Stack.Screen name="loan/index" options={{ title: 'Loan', headerShown: true }} />
        </Stack>
      </AppStateProvider>
    </ErrorBoundary>
  );
}