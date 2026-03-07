import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useFreemium } from '../contexts/FreemiumContext';
import { RootStackParamList } from '../utils/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type PlanType = 'yearly' | 'monthly';

export default function ProScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { upgradeToPro, isPro } = useFreemium();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const handlePurchase = async () => {
    await upgradeToPro();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.proHeaderLeft}>
          <View style={[styles.proIcon, { backgroundColor: c.primary }]}>
            <Text style={styles.proIconText}>&#x2605;</Text>
          </View>
          <Text style={[styles.proLabel, { color: c.primary }]}>PRO</Text>
        </View>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.closeX, { color: c.textSecondary }]}>&#x2715;</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ranking badge */}
        <View style={styles.rankingSection}>
          <View style={styles.laurelContainer}>
            <Text style={[styles.laurelText, { color: c.textMuted }]}>&#x1F33F;</Text>
            <View style={styles.rankCenter}>
              <Text style={[styles.rankNumber, { color: c.text }]}>1</Text>
              <Text style={[styles.rankSubtext, { color: c.textSecondary }]}>App Store</Text>
            </View>
            <Text style={[styles.laurelText, { color: c.textMuted, transform: [{ scaleX: -1 }] }]}>&#x1F33F;</Text>
          </View>
          <Text style={[styles.rankedText, { color: c.textSecondary }]}>
            {t('pro.ranked')}
          </Text>
        </View>

        {/* Hero */}
        <Text style={[styles.heroTitle, { color: c.text }]}>
          {t('pro.heroTitle')}
        </Text>

        {/* Plan Cards */}
        <View style={styles.plans}>
          {/* Yearly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'yearly' ? c.primary + '10' : c.surfaceElevated,
                borderColor: selectedPlan === 'yearly' ? c.primary : c.border,
                borderWidth: selectedPlan === 'yearly' ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            {/* Discount badge */}
            <View style={[styles.discountBadge, { backgroundColor: '#22C55E' }]}>
              <Text style={styles.discountBadgeText}>{t('pro.discount')}</Text>
            </View>

            <View style={styles.planLeft}>
              <View style={[styles.planRadio, { borderColor: selectedPlan === 'yearly' ? c.primary : c.border }]}>
                {selectedPlan === 'yearly' && <View style={[styles.planRadioInner, { backgroundColor: c.primary }]} />}
              </View>
              <View>
                <View style={styles.planNameRow}>
                  <Text style={[styles.planName, { color: c.text }]}>{t('pro.yearly')}</Text>
                  <View style={[styles.trialBadge, { backgroundColor: '#22C55E20' }]}>
                    <Text style={[styles.trialBadgeText, { color: '#22C55E' }]}>{t('pro.freeTrial')}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.planRight}>
              <Text style={[styles.planPrice, { color: c.text }]}>{t('pro.yearlyMonthPrice')}</Text>
              <View style={styles.planTotalRow}>
                <Text style={[styles.planOriginal, { color: c.textMuted }]}>{t('pro.yearlyOriginal')}</Text>
                <Text style={styles.planTotalSpace}> </Text>
                <Text style={[styles.planTotal, { color: c.textSecondary }]}>{t('pro.yearlyTotal')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'monthly' ? c.primary + '10' : c.surfaceElevated,
                borderColor: selectedPlan === 'monthly' ? c.primary : c.border,
                borderWidth: selectedPlan === 'monthly' ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planLeft}>
              <View style={[styles.planRadio, { borderColor: selectedPlan === 'monthly' ? c.primary : c.border }]}>
                {selectedPlan === 'monthly' && <View style={[styles.planRadioInner, { backgroundColor: c.primary }]} />}
              </View>
              <View>
                <Text style={[styles.planName, { color: c.text }]}>{t('pro.monthly')}</Text>
                <Text style={[styles.planNote, { color: c.textSecondary }]}>{t('pro.noTrial')}</Text>
              </View>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, { color: c.text }]}>{t('pro.monthlyPrice')}</Text>
              <Text style={[styles.planTotal, { color: c.textSecondary }]}>{t('pro.monthlyTotal')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Proof */}
        <Text style={[styles.socialProof, { color: c.primary }]}>
          {t('pro.socialProof')}
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((key) => (
            <View key={key} style={styles.featureRow}>
              <View style={[styles.featureCheck, { backgroundColor: c.primary + '20' }]}>
                <Text style={[styles.featureCheckText, { color: c.primary }]}>&#x2713;</Text>
              </View>
              <Text style={[styles.featureText, { color: c.text }]}>{t(`pro.${key}`)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomSection, { backgroundColor: c.background }]}>
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: c.primary }]}
          onPress={handlePurchase}
          activeOpacity={0.8}
        >
          <Text style={styles.purchaseButtonText}>
            {selectedPlan === 'yearly' ? t('pro.startTrial') : t('pro.subscribe')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.disclaimer, { color: c.textMuted }]}>
          {selectedPlan === 'yearly' ? t('pro.disclaimerYearly') : t('pro.disclaimerMonthly')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 56,
    paddingBottom: 8,
  },
  proHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proIconText: {
    color: '#FFF',
    fontSize: 16,
  },
  proLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  closeX: {
    fontSize: 20,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 160,
  },
  rankingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  laurelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  laurelText: {
    fontSize: 32,
  },
  rankCenter: {
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 48,
    fontWeight: '200',
    lineHeight: 52,
  },
  rankSubtext: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -4,
  },
  rankedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  plans: {
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 72,
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  discountBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  trialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  planNote: {
    fontSize: 12,
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  planTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  planOriginal: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  planTotalSpace: {
    width: 4,
  },
  planTotal: {
    fontSize: 12,
  },
  socialProof: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  features: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCheckText: {
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 40,
    paddingTop: 12,
  },
  purchaseButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
});
