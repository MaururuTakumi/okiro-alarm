import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MissionType } from '../utils/types';

const STORAGE_KEY = '@is_pro';
const FREE_MISSIONS: MissionType[] = ['none', 'math'];

interface FreemiumContextValue {
  isPro: boolean;
  upgradeToPro: () => Promise<void>;
  restorePurchase: () => Promise<void>;
  isMissionAvailable: (missionType: MissionType) => boolean;
}

const FreemiumContext = createContext<FreemiumContextValue>({
  isPro: false,
  upgradeToPro: async () => {},
  restorePurchase: async () => {},
  isMissionAvailable: () => false,
});

export function FreemiumProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'true') setIsPro(true);
    });
  }, []);

  const upgradeToPro = useCallback(async () => {
    // Placeholder for real IAP
    setIsPro(true);
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const restorePurchase = useCallback(async () => {
    // Placeholder for real restore
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value === 'true') setIsPro(true);
  }, []);

  const isMissionAvailable = useCallback(
    (missionType: MissionType) => {
      if (isPro) return true;
      return FREE_MISSIONS.includes(missionType);
    },
    [isPro],
  );

  return (
    <FreemiumContext.Provider value={{ isPro, upgradeToPro, restorePurchase, isMissionAvailable }}>
      {children}
    </FreemiumContext.Provider>
  );
}

export function useFreemium() {
  return useContext(FreemiumContext);
}
