import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: c.text }]}>
        {t('privacy.title')}
      </Text>
      <Text style={[styles.date, { color: c.textMuted }]}>
        {t('privacy.lastUpdated')}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>
        {t('privacy.section1Title')}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t('privacy.section1Body')}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>
        {t('privacy.section2Title')}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t('privacy.section2Body')}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>
        {t('privacy.section3Title')}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t('privacy.section3Body')}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>
        {t('privacy.section4Title')}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t('privacy.section4Body')}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>
        {t('privacy.section5Title')}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t('privacy.section5Body')}
      </Text>

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
    paddingTop: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 24,
  },
});
