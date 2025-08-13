
import { StyleSheet, Platform } from 'react-native';

export const colors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  secondary: '#5856D6',
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF3B30',
  warning: '#FF9500',
  success: '#34C759',
  accent: '#FF2D92',
  
  // Additional colors for better UI
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#48484A',
  placeholder: '#48484A',
  divider: '#48484A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const shadows = Platform.select({
  ios: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
  },
  android: {
    small: {
      elevation: 2,
    },
    medium: {
      elevation: 4,
    },
    large: {
      elevation: 8,
    },
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows?.medium,
  },
  
  surface: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonSecondaryText: {
    color: colors.primary,
  },
  
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  
  buttonDisabledText: {
    color: colors.textSecondary,
  },
  
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.sm,
  },
  
  successText: {
    fontSize: 14,
    color: colors.success,
    marginTop: spacing.sm,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  
  screenPadding: {
    paddingHorizontal: spacing.md,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flexGrow: {
    flexGrow: 1,
  },
  
  flex1: {
    flex: 1,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  marginBottomMd: {
    marginBottom: spacing.md,
  },
  
  marginTopMd: {
    marginTop: spacing.md,
  },
  
  paddingMd: {
    padding: spacing.md,
  },
  
  statusBar: {
    height: Platform.OS === 'ios' ? 44 : 24,
    backgroundColor: colors.background,
  },
});
