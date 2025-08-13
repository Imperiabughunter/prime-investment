
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageService {
  private static readonly KEYS = {
    USER_DATA: 'user_data',
    INVESTMENTS: 'investments',
    TRANSACTIONS: 'transactions',
    LOANS: 'loans',
    PLANS: 'plans',
    LAST_SYNC: 'last_sync',
  };

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw new Error('Failed to save data locally');
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }

  // App-specific methods
  static async cacheUserData(data: any): Promise<void> {
    await Promise.all([
      this.setItem(this.KEYS.INVESTMENTS, data.investments),
      this.setItem(this.KEYS.TRANSACTIONS, data.transactions),
      this.setItem(this.KEYS.LOANS, data.loans),
      this.setItem(this.KEYS.PLANS, data.plans),
      this.setItem(this.KEYS.LAST_SYNC, new Date().toISOString()),
    ]);
  }

  static async getCachedUserData() {
    const [investments, transactions, loans, plans, lastSync] = await Promise.all([
      this.getItem(this.KEYS.INVESTMENTS),
      this.getItem(this.KEYS.TRANSACTIONS),
      this.getItem(this.KEYS.LOANS),
      this.getItem(this.KEYS.PLANS),
      this.getItem(this.KEYS.LAST_SYNC),
    ]);

    return {
      investments: investments || [],
      transactions: transactions || [],
      loans: loans || [],
      plans: plans || [],
      lastSync,
    };
  }

  static async clearUserData(): Promise<void> {
    await Promise.all([
      this.removeItem(this.KEYS.INVESTMENTS),
      this.removeItem(this.KEYS.TRANSACTIONS),
      this.removeItem(this.KEYS.LOANS),
      this.removeItem(this.KEYS.PLANS),
      this.removeItem(this.KEYS.LAST_SYNC),
    ]);
  }
}
