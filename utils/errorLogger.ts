
//
// Global error logging for runtime errors
//
import { Platform } from 'react-native';

// Guard to avoid registering handlers multiple times during Fast Refresh
let initialized = false;

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 250);
};

// Safe stringify to avoid circular structure errors
const safeStringify = (value: any) => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        if (val instanceof Error) {
          return { name: val.name, message: val.message, stack: val.stack };
        }
        return val;
      },
      2
    );
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unserializable]';
    }
  }
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${safeStringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'EXPO_ERROR', // Keep type for host integration
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          source: 'expo-template',
        },
        '*'
      );
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.[jt]sx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // Skip the first few lines (Error, getCallerInfo, console override)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.indexOf('app/') !== -1 ||
      line.indexOf('components/') !== -1 ||
      line.indexOf('.tsx') !== -1 ||
      line.indexOf('.ts') !== -1
    ) {
      const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
      if (match) {
        return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
      }
    }
  }

  return '';
};

export const setupErrorLogging = () => {
  if (initialized) return;
  initialized = true;

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      const sourceFile = source ? source.split('/').pop() : 'unknown';
      const errorData = {
        message,
        source: `${sourceFile}:${lineno}:${colno}`,
        line: lineno,
        column: colno,
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        timestamp: new Date().toISOString(),
      };

      console.error('🚨 RUNTIME ERROR:', errorData);
      sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      return false; // Don't prevent default error handling
    };

    // Web-only promise rejection handling
    if (Platform.OS === 'web') {
      window.addEventListener('unhandledrejection', (event) => {
        const reason = (event as PromiseRejectionEvent).reason as any;
        const isAbort = typeof reason?.name === 'string' && reason.name.toLowerCase().includes('abort');
        const msg = reason?.message || String(reason);

        const errorData = {
          reason: reason instanceof Error ? { name: reason.name, message: reason.message, stack: reason.stack } : reason,
          message: msg,
          timestamp: new Date().toISOString(),
        };

        // Prevent default browser logging to avoid noisy "Unhandled Promise Rejection" entries
        try {
          if (typeof (event as any).preventDefault === 'function') (event as any).preventDefault();
        } catch {
          // no-op
        }

        // Demote known benign abort/cancel errors to info
        const level = isAbort || /aborted|cancelled|canceled/i.test(msg) ? 'info' : 'warn';

        console[level === 'info' ? 'log' : 'warn']('⚠️ Promise Rejection (handled globally):', errorData);
        sendErrorToParent(level, 'Promise Rejection (handled globally)', errorData);
      });
    }
  }

  // Store original console methods (kept for possible future enhancements)
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Optional: Enhanced console overrides are available but disabled by default

  // Try to intercept React warnings at a lower level (dev only)
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (internals.ReactDebugCurrentFrame) {
        const originalGetStackAddendum = internals.ReactDebugCurrentFrame.getStackAddendum;
        internals.ReactDebugCurrentFrame.getStackAddendum = function () {
          const stack = originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
          return stack + ' | Enhanced by error logger';
        };
      }
    }
  }
};
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userId?: string;
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(level: 'error' | 'warning' | 'info', message: string, error?: Error, context?: Record<string, any>, userId?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack: error?.stack,
      userId,
      context
    };

    this.logs.unshift(errorLog);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (__DEV__) {
      console[level](message, error, context);
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(errorLog);
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string) {
    this.log('error', message, error, context, userId);
  }

  warning(message: string, context?: Record<string, any>, userId?: string) {
    this.log('warning', message, undefined, context, userId);
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    this.log('info', message, undefined, context, userId);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  private async sendToLoggingService(errorLog: ErrorLog) {
    // Implement your logging service integration here
    // For example, send to Sentry, LogRocket, or your own backend
  }
}

export const errorLogger = new ErrorLogger();
