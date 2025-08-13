
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      <Text style={styles.text}>If you can see this, React Native Web is working</Text>
      <Text style={styles.text}>Current timestamp: {new Date().toISOString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
});
