import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryDark: string;
    accent: string;
    border: string;
    danger: string;
    success: string;
    cardBackground: string;
    gradient: {
      start: string;
      end: string;
    };
  };
}

const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F8F5F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FFF8F3',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    primary: '#FF6B35',
    primaryDark: '#E55A28',
    accent: '#FFB088',
    border: '#F0E6DC',
    danger: '#E53935',
    success: '#43A047',
    cardBackground: '#FFFFFF',
    gradient: {
      start: '#FF6B35',
      end: '#FF9A6C',
    },
  },
};

const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#0A0A0C',
    surface: '#141418',
    surfaceElevated: '#1C1C22',
    text: '#F5F5F7',
    textSecondary: '#8E8E93',
    textMuted: '#48484A',
    primary: '#FF6B35',
    primaryDark: '#E55A28',
    accent: '#FF9A6C',
    border: '#2C2C2E',
    danger: '#FF453A',
    success: '#32D74B',
    cardBackground: '#1C1C22',
    gradient: {
      start: '#FF6B35',
      end: '#FF9A6C',
    },
  },
};

interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const THEME_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') setMode(stored);
    });
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(THEME_KEY, next);
  };

  const setThemeMode = (m: 'light' | 'dark') => {
    setMode(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
