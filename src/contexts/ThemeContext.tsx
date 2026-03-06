import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    accent: string;
    border: string;
    danger: string;
    success: string;
  };
}

const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    primary: '#4A90D9',
    accent: '#FF6B35',
    border: '#E0E0E0',
    danger: '#E53935',
    success: '#43A047',
  },
};

const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    primary: '#64B5F6',
    accent: '#FF8A65',
    border: '#333333',
    danger: '#EF5350',
    success: '#66BB6A',
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
