import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Accelerometer } from 'expo-sensors';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  target: number;
  onComplete: () => void;
}

export default function ShakeMission({ target, onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [shakes, setShakes] = useState(0);
  const shakesRef = useRef(0);

  useEffect(() => {
    let lastMag = 0;
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      if (Math.abs(mag - lastMag) > 1.5) {
        shakesRef.current++;
        setShakes(shakesRef.current);
        Vibration.vibrate(50);
        if (shakesRef.current >= target) onComplete();
      }
      lastMag = mag;
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [target, onComplete]);

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.shake.title')}</Text>
      <Text style={[styles.progressText, { color: c.text }]}>
        {t('mission.shake.progress', { current: shakes, target })}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { backgroundColor: c.success, width: `${Math.min(100, (shakes / target) * 100)}%` }]} />
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
