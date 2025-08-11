
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { useAppState } from '../../state/AppState';
import { Button } from '../../components/Button';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAppState();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your Prime account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      <Button
        title={loading ? 'Signing In...' : 'Sign In'}
        onPress={handleSignIn}
        disabled={loading}
        style={styles.button}
      />

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Don't have an account?{' '}
          <Link href="/(auth)/signup" style={styles.link}>
            Sign Up
          </Link>
        </Text>
      </View>

      <View style={styles.linkContainer}>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot Password?
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFB800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#111',
    color: '#fff',
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    color: '#FFB800',
    fontWeight: '600',
  },
});
