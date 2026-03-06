import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../utils/types';

interface AlarmContextType {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  getAlarm: (id: string) => Alarm | undefined;
}

const AlarmContext = createContext<AlarmContextType>({
  alarms: [],
  addAlarm: () => {},
  updateAlarm: () => {},
  deleteAlarm: () => {},
  toggleAlarm: () => {},
  getAlarm: () => undefined,
});

const STORAGE_KEY = '@alarms';

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setAlarms(JSON.parse(data));
    });
  }, []);

  const persist = useCallback((updated: Alarm[]) => {
    setAlarms(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addAlarm = useCallback((alarm: Alarm) => {
    persist([...alarms, alarm]);
  }, [alarms, persist]);

  const updateAlarm = useCallback((alarm: Alarm) => {
    persist(alarms.map((a) => (a.id === alarm.id ? alarm : a)));
  }, [alarms, persist]);

  const deleteAlarm = useCallback((id: string) => {
    persist(alarms.filter((a) => a.id !== id));
  }, [alarms, persist]);

  const toggleAlarm = useCallback((id: string) => {
    persist(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, [alarms, persist]);

  const getAlarm = useCallback((id: string) => {
    return alarms.find((a) => a.id === id);
  }, [alarms]);

  return (
    <AlarmContext.Provider value={{ alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, getAlarm }}>
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarms = () => useContext(AlarmContext);
