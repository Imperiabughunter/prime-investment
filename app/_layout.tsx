import React from 'react';
import { Stack } from 'expo-router';
import { AppStateProvider } from '../state/AppState';
import { setupErrorLogging } from '../utils/errorLogger';

// Setup error logging
setupErrorLogging();

export default function RootLayout() {
  return (
    <AppStateProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="calculator" options={{ title: 'Calculator' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="transfer" options={{ title: 'Transfer' }} />
        <Stack.Screen name="investments" options={{ title: 'Investments' }} />
        <Stack.Screen name="loan" options={{ title: 'Loan' }} />
      </Stack>
    </AppStateProvider>
  );
}