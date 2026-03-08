import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StripeProvider } from '@stripe/stripe-react-native';
import './src/locales/i18n';
import { AlarmProvider } from './src/contexts/AlarmContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { FreemiumProvider } from './src/contexts/FreemiumContext';

// TODO: Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY || 'pk_test_placeholder';
import HomeScreen from './src/screens/HomeScreen';
import AlarmSetScreen from './src/screens/AlarmSetScreen';
import MissionScreen from './src/screens/MissionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SetupScreen from './src/screens/SetupScreen';
import ProScreen from './src/screens/ProScreen';
import { RootStackParamList, MainTabParamList, MissionType, MissionConfig } from './src/utils/types';
import { requestPermissions } from './src/utils/notifications';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const SETUP_COMPLETED_KEY = '@setup_completed';

function MainTabs() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.text,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home.title'),
          tabBarLabel: t('home.title'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>&#x23F0;</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          tabBarLabel: t('settings.title'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>&#x2699;</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SETUP_COMPLETED_KEY).then((val) => {
      setInitialRoute(val === 'true' ? 'MainTabs' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          contentStyle: { backgroundColor: c.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Setup"
          component={SetupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="AlarmSet"
          component={AlarmSetScreen}
          options={({ route }) => ({
            title: route.params?.alarmId ? t('alarmSet.editTitle') : t('alarmSet.title'),
            headerStyle: { backgroundColor: c.background },
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
        <Stack.Screen
          name="Pro"
          component={ProScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
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
          preventSnooze: data.preventSnooze as boolean | undefined,
          payToSnooze: data.payToSnooze as boolean | undefined,
          snoozeCost: data.snoozeCost as number | undefined,
          repeatAlarm: data.repeatAlarm as boolean | undefined,
          repeatInterval: data.repeatInterval as number | undefined,
          maxRepeats: data.maxRepeats as number | undefined,
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <FreemiumProvider>
          <AlarmProvider>
            <AppNavigator />
          </AlarmProvider>
        </FreemiumProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}
