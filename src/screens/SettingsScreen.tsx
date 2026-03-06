import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const LANGUAGES = ['en', 'ja', 'zh', 'ko'] as const;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, setThemeMode } = useTheme();
  const c = theme.colors;

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.language')}</Text>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.optionRow,
              { borderColor: c.border },
              i18n.language === lang && { backgroundColor: c.primary + '20' },
            ]}
            onPress={() => i18n.changeLanguage(lang)}
          >
            <Text style={[styles.optionText, { color: c.text }]}>
              {t(`settings.languages.${lang}`)}
            </Text>
            {i18n.language === lang && <Text style={[styles.check, { color: c.primary }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.theme')}</Text>
        {(['light', 'dark'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.optionRow,
              { borderColor: c.border },
              theme.mode === mode && { backgroundColor: c.primary + '20' },
            ]}
            onPress={() => setThemeMode(mode)}
          >
            <Text style={[styles.optionText, { color: c.text }]}>
              {t(`settings.themes.${mode}`)}
            </Text>
            {theme.mode === mode && <Text style={[styles.check, { color: c.primary }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.about')}</Text>
        <Text style={[styles.versionText, { color: c.textSecondary }]}>
          {t('settings.version')}: 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionText: { fontSize: 16 },
  check: { fontSize: 18, fontWeight: '600' },
  versionText: { fontSize: 14 },
});
