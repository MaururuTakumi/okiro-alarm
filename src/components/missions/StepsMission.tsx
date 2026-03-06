import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Accelerometer, Pedometer } from 'expo-sensors';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  target: number;
  onComplete: () => void;
}

export default function StepsMission({ target, onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    const start = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (available) {
        subscription = Pedometer.watchStepCount((result) => {
          setSteps(result.steps);
          if (result.steps >= target) onComplete();
        });
      } else {
        // Fallback: use accelerometer to simulate steps
        let count = 0;
        let lastMag = 0;
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const mag = Math.sqrt(x * x + y * y + z * z);
          if (Math.abs(mag - lastMag) > 0.5) {
            count++;
            setSteps(count);
            if (count >= target) onComplete();
          }
          lastMag = mag;
        });
        Accelerometer.setUpdateInterval(200);
      }
    };
    start();
    return () => { subscription?.remove(); };
  }, [target, onComplete]);

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.steps.title')}</Text>
      <Text style={[styles.progressText, { color: c.text }]}>
        {t('mission.steps.progress', { current: steps, target })}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { backgroundColor: c.success, width: `${Math.min(100, (steps / target) * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  progressText: { fontSize: 32, fontWeight: '600', marginBottom: 20 },
  progressBar: { width: '80%', height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
});
