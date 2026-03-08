import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useFreemium } from '../contexts/FreemiumContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import { paymentService, PaymentMethod } from '../services/PaymentService';

const LANGUAGES = ['en', 'ja', 'zh', 'ko'] as const;
const APP_VERSION = '1.0.0';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isPro } = useFreemium();
  const navigation = useNavigation<NavigationProp>();
  const c = theme.colors;
  const isDark = theme.mode === 'dark';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [totalCharged, setTotalCharged] = useState(0);

  const topPadding = Platform.OS === 'web' ? 24 : Platform.OS === 'ios' ? 60 : 48;

  useEffect(() => {
    paymentService.getPaymentMethod().then(setPaymentMethod);
    paymentService.getTotalCharged().then(setTotalCharged);
  }, []);

  const handleSetupPayment = useCallback(async () => {
    // TODO: Open Stripe card setup sheet
    // For now, simulate saving a test card
    if (__DEV__) {
      const testMethod: PaymentMethod = {
        id: 'pm_test_' + Date.now(),
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2028,
      };
      await paymentService.savePaymentMethod(testMethod);
      setPaymentMethod(testMethod);
      Alert.alert(t('settings.paymentSaved'), t('settings.paymentSavedDesc'));
    }
  }, [t]);

  const handleRemovePayment = useCallback(async () => {
    Alert.alert(
      t('settings.removePayment'),
      t('settings.removePaymentDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await paymentService.removePaymentMethod();
            setPaymentMethod(null);
          },
        },
      ],
    );
  }, [t]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding }]}
    >
      {/* Header */}
      <Text style={[styles.headerTitle, { color: c.text }]}>
        {t('settings.title')}
      </Text>

      {/* Pro Banner Card */}
      <TouchableOpacity
        style={[styles.proBanner, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('Pro')}
        activeOpacity={0.85}
      >
        <View style={styles.proBannerContent}>
          <View style={styles.proBannerLeft}>
            <Text style={styles.proIcon}>&#9733;</Text>
            <View style={styles.proBannerTextWrap}>
              <Text style={styles.proBannerTitle}>{t('settings.pro')}</Text>
              <Text style={styles.proBannerDesc}>{t('settings.proDesc')}</Text>
            </View>
          </View>
          {isPro ? (
            <View style={styles.proActiveBadge}>
              <Text style={styles.proActiveBadgeText}>Active</Text>
            </View>
          ) : (
            <Text style={styles.proArrow}>&#8250;</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Subscription Section */}
      <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          {t('settings.subscription')}
        </Text>
        <View style={[styles.row, { borderBottomColor: c.border }]}>
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.pro')}
          </Text>
          <Text style={[styles.rowValue, { color: isPro ? c.success : c.textMuted }]}>
            {isPro ? 'Active' : 'Free'}
          </Text>
        </View>
      </View>

      {/* Payment Section (Pay to Snooze) */}
      <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          {t('settings.payment')}
        </Text>

        {/* Payment Method */}
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: c.border }]}
          onPress={paymentMethod ? handleRemovePayment : handleSetupPayment}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.paymentMethod')}
          </Text>
          {paymentMethod ? (
            <View style={styles.cardInfo}>
              <Text style={[styles.cardBrand, { color: c.text }]}>
                {paymentMethod.brand}
              </Text>
              <Text style={[styles.cardLast4, { color: c.textSecondary }]}>
                **** {paymentMethod.last4}
              </Text>
            </View>
          ) : (
            <Text style={[styles.rowValue, { color: c.primary }]}>
              {t('settings.addCard')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Total Charged */}
        <View style={[styles.row, styles.rowNoBorder]}>
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.totalSnoozeCharged')}
          </Text>
          <Text style={[styles.rowValue, { color: totalCharged > 0 ? c.primary : c.textMuted }]}>
            {t('alarmSet.snoozeCostValue', { amount: totalCharged })}
          </Text>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          {t('settings.theme')}
        </Text>
        <View style={[styles.row, styles.rowNoBorder]}>
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.darkMode')}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: c.border, true: c.primary + '80' }}
            thumbColor={isDark ? c.primary : '#f4f3f4'}
            ios_backgroundColor={c.border}
          />
        </View>
      </View>

      {/* Language Section */}
      <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          {t('settings.language')}
        </Text>
        {LANGUAGES.map((lang, index) => {
          const isSelected = i18n.language === lang;
          const isLast = index === LANGUAGES.length - 1;
          return (
            <TouchableOpacity
              key={lang}
              style={[
                styles.row,
                isLast ? styles.rowNoBorder : { borderBottomColor: c.border },
                isSelected && { backgroundColor: c.primary + '12' },
              ]}
              onPress={() => i18n.changeLanguage(lang)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowText, { color: c.text }]}>
                {t(`settings.languages.${lang}`)}
              </Text>
              {isSelected && (
                <Text style={[styles.checkmark, { color: c.primary }]}>&#10003;</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* About Section */}
      <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          {t('settings.about')}
        </Text>

        <View style={[styles.row, { borderBottomColor: c.border }]}>
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.version')}
          </Text>
          <Text style={[styles.rowValue, { color: c.textMuted }]}>
            {APP_VERSION}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.row, { borderBottomColor: c.border }]}
          onPress={() => {
            const storeUrl =
              Platform.OS === 'ios'
                ? 'https://apps.apple.com/app/okiro/id000000000'
                : Platform.OS === 'android'
                ? 'https://play.google.com/store/apps/details?id=com.okiro'
                : '';
            if (storeUrl) Linking.openURL(storeUrl);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.rateApp')}
          </Text>
          <Text style={[styles.rowArrow, { color: c.textMuted }]}>&#8250;</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, styles.rowNoBorder]}
          onPress={() => {
            Linking.openURL('mailto:support@okiro.app');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowText, { color: c.text }]}>
            {t('settings.helpFeedback')}
          </Text>
          <Text style={[styles.rowArrow, { color: c.textMuted }]}>&#8250;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
  },

  // Pro Banner
  proBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginRight: 14,
  },
  proBannerTextWrap: {
    flex: 1,
  },
  proBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  proBannerDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  proArrow: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  proActiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  proActiveBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Section Cards
  sectionCard: {
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Payment
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardLast4: {
    fontSize: 14,
  },

  bottomSpacer: {
    height: 24,
  },
});
