import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from './Button'; // Assuming Button is a local component

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);

    // Send error to error logging service
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(
        {
          type: 'EXPO_ERROR',
          level: 'error',
          message: 'React Error Boundary',
          data: {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
          timestamp: new Date().toISOString(),
        },
        '*'
      );
    }
  }

  handleRetry = () => {
    // Reset the error state to allow the app to re-render
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Check if the error is related to authentication
      const isAuthError = this.state.error?.message?.includes('auth') || 
                         this.state.error?.message?.includes('Authentication');

      if (this.props.fallback) {
        // If a custom fallback is provided, render it
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          {/* Render retry button for all errors */}
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000', // Dark background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB800', // Amber color for title
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#fff', // White text for message
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    fontSize: 12,
    color: '#FF6B6B', // Reddish color for error details
    fontFamily: 'monospace',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    minWidth: 120,
    backgroundColor: '#FFB800', // Amber button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000', // Black text for button
    fontSize: 16,
    fontWeight: 'bold',
  },
});