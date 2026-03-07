import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../utils/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

function SunriseIcon({ size = 80 }: { size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={[iconStyles.container, { width: size, height: size }]}>
      <View style={[iconStyles.sun, { backgroundColor: theme.colors.primary, width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]} />
      <View style={[iconStyles.ray, { backgroundColor: theme.colors.accent, width: size * 0.08, height: size * 0.25, top: 0, left: size * 0.46 }]} />
      <View style={[iconStyles.ray, { backgroundColor: theme.colors.accent, width: size * 0.08, height: size * 0.25, bottom: 0, left: size * 0.46 }]} />
      <View style={[iconStyles.ray, { backgroundColor: theme.colors.accent, width: size * 0.25, height: size * 0.08, left: 0, top: size * 0.46 }]} />
      <View style={[iconStyles.ray, { backgroundColor: theme.colors.accent, width: size * 0.25, height: size * 0.08, right: 0, top: size * 0.46 }]} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  sun: { position: 'absolute' },
  ray: { position: 'absolute', borderRadius: 4 },
});

function BrainIcon({ size = 80 }: { size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <View style={{ width: size * 0.35, height: size * 0.5, borderRadius: size * 0.175, borderWidth: 2.5, borderColor: theme.colors.primary }} />
        <View style={{ width: size * 0.35, height: size * 0.5, borderRadius: size * 0.175, borderWidth: 2.5, borderColor: theme.colors.accent }} />
      </View>
      <View style={{ width: size * 0.3, height: 3, backgroundColor: theme.colors.primary, marginTop: 6, borderRadius: 2 }} />
    </View>
  );
}

function JapanIcon({ size = 80 }: { size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.7,
        height: size * 0.7,
        borderRadius: size * 0.35,
        borderWidth: 3,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          backgroundColor: theme.colors.primary,
        }} />
      </View>
    </View>
  );
}

interface PageData {
  key: string;
  renderIcon: () => React.ReactNode;
  renderExtra?: () => React.ReactNode;
  isLast: boolean;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pages: PageData[] = [
    {
      key: 'page1',
      renderIcon: () => <SunriseIcon size={100} />,
      isLast: false,
    },
    {
      key: 'page2',
      renderIcon: () => <BrainIcon size={100} />,
      renderExtra: () => (
        <View style={styles.statsRow}>
          <View style={[styles.statBubble, { backgroundColor: c.surfaceElevated }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{t('onboarding.page2.stat1Value')}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('onboarding.page2.stat1Label')}</Text>
          </View>
          <View style={[styles.statBubble, { backgroundColor: c.surfaceElevated }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{t('onboarding.page2.stat2Value')}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('onboarding.page2.stat2Label')}</Text>
          </View>
        </View>
      ),
      isLast: false,
    },
    {
      key: 'page3',
      renderIcon: () => <JapanIcon size={100} />,
      isLast: true,
    },
  ];

  const goToNext = () => {
    if (currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('Setup');
    }
  };

  const skip = () => {
    navigation.replace('Setup');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const renderPage = ({ item }: { item: PageData }) => (
    <View style={[styles.page, { width }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconGlow, { backgroundColor: c.primary }]} />
        {item.renderIcon()}
      </View>
      <Text style={[styles.title, { color: c.text }]}>
        {t(`onboarding.${item.key}.title`)}
      </Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        {t(`onboarding.${item.key}.subtitle`)}
      </Text>
      {item.renderExtra?.()}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {!pages[currentIndex].isLast && (
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={[styles.skipText, { color: c.textSecondary }]}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.bottomSection}>
        <View style={[styles.bottomGradientOverlay, { backgroundColor: c.background }]} />
        <View style={styles.dotsRow}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? c.primary : c.border },
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: c.primary,
              shadowColor: c.primary,
            },
          ]}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {pages[currentIndex].isLast ? t('onboarding.page3.cta') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 160,
  },
  iconContainer: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  statBubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomGradientOverlay: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.85,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 28,
    borderRadius: 5,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
