import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import './src/locales/i18n';
import { AlarmProvider } from './src/contexts/AlarmContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { FreemiumProvider } from './src/contexts/FreemiumContext';
import HomeScreen from './src/screens/HomeScreen';
import AlarmSetScreen from './src/screens/AlarmSetScreen';
import MissionScreen from './src/screens/MissionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { RootStackParamList, MainTabParamList, MissionType, MissionConfig } from './src/utils/types';
import { requestPermissions } from './src/utils/notifications';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home.title'),
          tabBarLabel: t('home.title'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          tabBarLabel: t('settings.title'),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="AlarmSet"
          component={AlarmSetScreen}
          options={({ route }) => ({
            title: route.params?.alarmId ? t('alarmSet.editTitle') : t('alarmSet.title'),
          })}
        />
        <Stack.Screen
          name="Mission"
          component={MissionScreen}
          options={{
            title: t('mission.title'),
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.alarmId && data?.missionType && data.missionType !== 'none') {
        navigationRef.current?.navigate('Mission', {
          alarmId: data.alarmId as string,
          missionType: data.missionType as MissionType,
          missionConfig: (data.missionConfig as MissionConfig) || {},
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider>
      <FreemiumProvider>
        <AlarmProvider>
          <AppNavigator />
        </AlarmProvider>
      </FreemiumProvider>
    </ThemeProvider>
  );
}
