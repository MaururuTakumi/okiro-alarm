import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Purchases, { PurchasesPackage, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { MissionType } from '../utils/types';
import { PRO_ENTITLEMENT_ID, paymentService } from '../services/PaymentService';

const REVENUECAT_API_KEY_IOS = 'REVENUECAT_API_KEY_IOS';
const REVENUECAT_API_KEY_ANDROID = 'REVENUECAT_API_KEY_ANDROID';

const FREE_MISSIONS: MissionType[] = ['none', 'math', 'memory'];

interface FreemiumContextValue {
  isPro: boolean;
  offerings: PurchasesPackage[];
  upgradeToPro: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchase: () => Promise<void>;
  isMissionAvailable: (missionType: MissionType) => boolean;
}

const FreemiumContext = createContext<FreemiumContextValue>({
  isPro: false,
  offerings: [],
  upgradeToPro: async () => {},
  restorePurchase: async () => {},
  isMissionAvailable: () => false,
});

export function FreemiumProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    const init = async () => {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
      Purchases.configure({ apiKey });

      // Check current entitlements
      const isActive = await paymentService.checkProStatus();
      setIsPro(isActive);

      // Fetch offerings
      try {
        const offeringsResult = await Purchases.getOfferings();
        if (offeringsResult.current) {
          setOfferings(offeringsResult.current.availablePackages);
        }
      } catch (e) {
        console.warn('Failed to fetch offerings:', e);
      }
    };

    init();
  }, []);

  const upgradeToPro = useCallback(async (pkg: PurchasesPackage) => {
    const customerInfo = await paymentService.purchaseProPackage(pkg);
    if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
      setIsPro(true);
    }
  }, []);

  const restorePurchase = useCallback(async () => {
    const customerInfo = await paymentService.restorePurchases();
    if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
      setIsPro(true);
    }
  }, []);

  const isMissionAvailable = useCallback(
    (missionType: MissionType) => {
      if (isPro) return true;
      return FREE_MISSIONS.includes(missionType);
    },
    [isPro],
  );

  return (
    <FreemiumContext.Provider value={{ isPro, offerings, upgradeToPro, restorePurchase, isMissionAvailable }}>
      {children}
    </FreemiumContext.Provider>
  );
}

export function useFreemium() {
  return useContext(FreemiumContext);
}
