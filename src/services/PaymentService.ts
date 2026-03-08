import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SNOOZE_HISTORY_KEY = '@snooze_charges';

// RevenueCat entitlement identifier for Pro subscription
export const PRO_ENTITLEMENT_ID = 'pro';

// RevenueCat product identifiers
export const PRODUCT_IDS = {
  MONTHLY: 'okiro_pro_monthly',
  YEARLY: 'okiro_pro_yearly',
};

// Pay to Snooze consumable product IDs (100-yen increments)
export const SNOOZE_PRODUCT_IDS: Record<number, string> = {
  100: 'okiro_snooze_100',
  300: 'okiro_snooze_300',
  500: 'okiro_snooze_500',
  1000: 'okiro_snooze_1000',
  3000: 'okiro_snooze_3000',
  5000: 'okiro_snooze_5000',
  10000: 'okiro_snooze_10000',
};

export const SNOOZE_AMOUNTS = [100, 300, 500, 1000, 3000, 5000, 10000];

export interface SnoozeCharge {
  id: string;
  amount: number;
  timestamp: number;
  alarmId: string;
}

class PaymentService {
  /**
   * Purchase a Pro subscription package
   */
  async purchaseProPackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  }

  /**
   * Purchase a consumable snooze product
   */
  async purchaseSnooze(amount: number, alarmId: string): Promise<boolean> {
    const productId = SNOOZE_PRODUCT_IDS[amount];
    if (!productId) {
      console.warn('Invalid snooze amount:', amount);
      return false;
    }

    try {
      const products = await Purchases.getProducts([productId]);
      if (products.length === 0) {
        console.warn('Snooze product not found:', productId);
        if (__DEV__) {
          await this.recordCharge({ amount, alarmId });
          return true;
        }
        return false;
      }

      await Purchases.purchaseStoreProduct(products[0]);
      await this.recordCharge({ amount, alarmId });
      return true;
    } catch (e: any) {
      if (e.userCancelled) return false;
      console.warn('Snooze purchase error:', e);
      if (__DEV__) {
        await this.recordCharge({ amount, alarmId });
        return true;
      }
      return false;
    }
  }

  /**
   * Get available snooze products with prices
   */
  async getSnoozeProducts(): Promise<PurchasesStoreProduct[]> {
    const ids = Object.values(SNOOZE_PRODUCT_IDS);
    return Purchases.getProducts(ids);
  }

  /**
   * Check if user has active Pro entitlement
   */
  async checkProStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    return Purchases.restorePurchases();
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
