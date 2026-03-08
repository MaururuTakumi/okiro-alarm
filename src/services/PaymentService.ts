import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_METHOD_KEY = '@payment_method';
const SNOOZE_HISTORY_KEY = '@snooze_charges';

// TODO: Replace with your actual backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend.com/api';

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface SnoozeCharge {
  id: string;
  amount: number;
  timestamp: number;
  alarmId: string;
}

class PaymentService {
  private cachedPaymentMethod: PaymentMethod | null = null;

  /**
   * Get the saved payment method
   */
  async getPaymentMethod(): Promise<PaymentMethod | null> {
    if (this.cachedPaymentMethod) return this.cachedPaymentMethod;
    try {
      const data = await AsyncStorage.getItem(PAYMENT_METHOD_KEY);
      if (data) {
        this.cachedPaymentMethod = JSON.parse(data);
        return this.cachedPaymentMethod;
      }
    } catch (e) {
      console.warn('Failed to get payment method:', e);
    }
    return null;
  }

  /**
   * Save a payment method locally after Stripe setup
   */
  async savePaymentMethod(method: PaymentMethod): Promise<void> {
    this.cachedPaymentMethod = method;
    await AsyncStorage.setItem(PAYMENT_METHOD_KEY, JSON.stringify(method));
  }

  /**
   * Remove the saved payment method
   */
  async removePaymentMethod(): Promise<void> {
    this.cachedPaymentMethod = null;
    await AsyncStorage.removeItem(PAYMENT_METHOD_KEY);
  }

  /**
   * Check if a payment method is set up
   */
  async hasPaymentMethod(): Promise<boolean> {
    const method = await this.getPaymentMethod();
    return method !== null;
  }

  /**
   * Create a SetupIntent on the backend for saving a card
   * Returns clientSecret for Stripe SDK
   */
  async createSetupIntent(): Promise<{ clientSecret: string; customerId: string }> {
    // TODO: Replace with actual API call to your backend
    // Backend should:
    // 1. Create/get Stripe Customer
    // 2. Create SetupIntent with that customer
    // 3. Return clientSecret
    const response = await fetch(`${API_BASE_URL}/create-setup-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create setup intent');
    return response.json();
  }

  /**
   * Charge the user for a snooze
   * Returns true if charge was successful
   */
  async chargeSnooze(amount: number, alarmId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // Backend should:
      // 1. Create PaymentIntent with saved PaymentMethod
      // 2. Confirm payment off_session
      // 3. Return success/failure
      const response = await fetch(`${API_BASE_URL}/charge-snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, alarmId }),
      });

      if (!response.ok) {
        console.warn('Snooze charge failed:', response.status);
        return false;
      }

      // Record the charge locally
      await this.recordCharge({ amount, alarmId });
      return true;
    } catch (e) {
      console.warn('Snooze charge error:', e);
      // In development, simulate success
      if (__DEV__) {
        await this.recordCharge({ amount, alarmId });
        return true;
      }
      return false;
    }
  }

  /**
   * Record a charge in local history
   */
  private async recordCharge({ amount, alarmId }: { amount: number; alarmId: string }): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(SNOOZE_HISTORY_KEY);
      const history: SnoozeCharge[] = historyJson ? JSON.parse(historyJson) : [];
      history.push({
        id: `sc_${Date.now()}`,
        amount,
        timestamp: Date.now(),
        alarmId,
      });
      // Keep last 100 charges
      const trimmed = history.slice(-100);
      await AsyncStorage.setItem(SNOOZE_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to record charge:', e);
    }
  }

  /**
   * Get snooze charge history
   */
  async getChargeHistory(): Promise<SnoozeCharge[]> {
    try {
      const data = await AsyncStorage.getItem(SNOOZE_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get total amount charged for snoozes
   */
  async getTotalCharged(): Promise<number> {
    const history = await this.getChargeHistory();
    return history.reduce((sum, charge) => sum + charge.amount, 0);
  }
}

export const paymentService = new PaymentService();
