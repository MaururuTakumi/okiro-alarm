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
import { useTheme } from '../contexts/ThemeContext';
import { useFreemium } from '../contexts/FreemiumContext';

type PlanType = 'yearly' | 'monthly';

export default function ProScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const { upgradeToPro } = useFreemium();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const handlePurchase = async () => {
    await upgradeToPro();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <View style={[styles.closeCircle, { backgroundColor: c.surfaceElevated }]}>
          <Text style={[styles.closeText, { color: c.textSecondary }]}>&#x2715;</Text>
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Pro badge */}
        <View style={styles.header}>
          <View style={[styles.proIcon, { backgroundColor: c.primary }]}>
            <Text style={styles.proIconText}>&#x2605;</Text>
          </View>
          <Text style={[styles.proLabel, { color: c.primary }]}>PRO</Text>
        </View>

        {/* Ranking badge */}
        <View style={styles.rankingSection}>
          <View style={styles.laurelContainer}>
            <Text style={[styles.laurelText, { color: c.textMuted }]}>&#x1F33F;</Text>
            <View style={styles.rankCircle}>
              <Text style={[styles.rankNumber, { color: c.text }]}>1</Text>
              <Text style={[styles.rankSubtext, { color: c.textSecondary }]}>App Store</Text>
            </View>
            <Text style={[styles.laurelText, { color: c.textMuted }]}>&#x1F33F;</Text>
          </View>
          <Text style={[styles.rankedText, { color: c.textSecondary }]}>
            {t('pro.ranked')}
          </Text>
        </View>

        {/* Hero */}
        <Text style={[styles.heroTitle, { color: c.text }]}>
          {t('pro.heroTitle')}
        </Text>
        <Text style={[styles.heroSubtitle, { color: c.textSecondary }]}>
          {t('pro.heroSubtitle')}
        </Text>

        {/* Plan Cards */}
        <View style={styles.plans}>
          {/* Yearly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: c.surfaceElevated,
                borderColor: selectedPlan === 'yearly' ? c.primary : c.border,
                borderWidth: selectedPlan === 'yearly' ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            {selectedPlan === 'yearly' && (
              <View style={[styles.bestValue, { backgroundColor: c.success }]}>
                <Text style={styles.bestValueText}>{t('pro.bestValue')}</Text>
              </View>
            )}
            <View style={styles.planInfo}>
              <View style={[styles.planRadio, { borderColor: selectedPlan === 'yearly' ? c.primary : c.border }]}>
                {selectedPlan === 'yearly' && <View style={[styles.planRadioInner, { backgroundColor: c.primary }]} />}
              </View>
              <View>
                <View style={styles.planNameRow}>
                  <Text style={[styles.planName, { color: c.text }]}>{t('pro.yearly')}</Text>
                  <View style={[styles.trialBadge, { backgroundColor: c.success + '20' }]}>
                    <Text style={[styles.trialBadgeText, { color: c.success }]}>{t('pro.freeTrial')}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: c.text }]}>{t('pro.yearlyPrice')}</Text>
              <Text style={[styles.planTotal, { color: c.textSecondary }]}>
                {t('pro.monthlyTotal')}
              </Text>
              <Text style={[styles.planPeriod, { color: c.textSecondary }]}>{t('pro.yearlyTotal')}</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: c.surfaceElevated,
                borderColor: selectedPlan === 'monthly' ? c.primary : c.border,
                borderWidth: selectedPlan === 'monthly' ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planInfo}>
              <View style={[styles.planRadio, { borderColor: selectedPlan === 'monthly' ? c.primary : c.border }]}>
                {selectedPlan === 'monthly' && <View style={[styles.planRadioInner, { backgroundColor: c.primary }]} />}
              </View>
              <View>
                <Text style={[styles.planName, { color: c.text }]}>{t('pro.monthly')}</Text>
                <Text style={[styles.planNote, { color: c.textSecondary }]}>{t('pro.noTrial')}</Text>
              </View>
            </View>
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: c.text }]}>{t('pro.monthlyPrice')}</Text>
              <Text style={[styles.planPeriod, { color: c.textSecondary }]}>{t('pro.monthlyTotal')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Proof */}
        <Text style={[styles.socialProof, { color: c.text }]}>
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
          <Text style={styles.purchaseButtonText}>{t('pro.startTrial')}</Text>
        </TouchableOpacity>
        <Text style={[styles.disclaimer, { color: c.textMuted }]}>
          {t('pro.disclaimer')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 56,
    right: 20,
    zIndex: 10,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 80,
    paddingBottom: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
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
  rankingSection: {
    alignItems: 'center',
    marginBottom: 28,
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
  rankCircle: {
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
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
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
  },
  bestValue: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    paddingVertical: 2,
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
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  planTotal: {
    fontSize: 11,
    marginTop: 2,
    textDecorationLine: 'line-through',
  },
  planPeriod: {
    fontSize: 12,
    marginTop: 2,
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
