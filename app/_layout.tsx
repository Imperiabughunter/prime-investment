
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { AppStateProvider } from '../state/AppState';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    setupErrorLogging();

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
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
            }}
          />
        </AppStateProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
