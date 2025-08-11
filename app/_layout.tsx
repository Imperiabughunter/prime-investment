import React from 'react';
import { Stack } from 'expo-router';
import { AppStateProvider, useAppState } from '../state/AppState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { setupErrorLogging } from '../utils/errorLogger';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const STORAGE_KEY = 'emulated_device';

// Initialize error logging
setupErrorLogging();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppState();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    // setupErrorLogging(); // Already called globally

    if (Platform.OS === 'web') {
      try {
        const url = new URL(window.location.href);
        const emulate = url.searchParams.get('emulate') || undefined;
        if (emulate) {
          localStorage.setItem(STORAGE_KEY, emulate);
          setStoredEmulate(emulate);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setStoredEmulate(stored);
        }
      } catch (e) {
        console.log('Failed to parse emulate param');
      }
    }
  }, []);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    } as const;

    const deviceToEmulate = storedEmulate;
    insetsToUse = deviceToEmulate
      ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets
      : actualInsets;
  }

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          commonStyles.wrapper,
          {
            paddingTop: insetsToUse.top,
            paddingBottom: insetsToUse.bottom,
            paddingLeft: insetsToUse.left,
            paddingRight: insetsToUse.right,
          },
        ]}
      >
        <StatusBar style="light" />
        <AppStateProvider>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#000',
                },
                headerTintColor: '#FFB800',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                animation: 'default',
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ title: 'Prime' }} />
              <Stack.Screen name="investments" options={{ title: 'Investments' }} />
              <Stack.Screen name="loan" options={{ title: 'Loans' }} />
              <Stack.Screen name="transfer" options={{ title: 'Transfer' }} />
              <Stack.Screen name="calculator" options={{ title: 'Calculator' }} />
              <Stack.Screen name="history" options={{ title: 'History' }} />
            </Stack>
          </AuthGuard>
        </AppStateProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});