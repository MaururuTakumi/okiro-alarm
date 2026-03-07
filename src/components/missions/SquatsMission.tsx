import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Accelerometer } from 'expo-sensors';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  target: number;
  onComplete: () => void;
}

export default function SquatsMission({ target, onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [squats, setSquats] = useState(0);
  const squatsRef = useRef(0);

  useEffect(() => {
    let phase: 'idle' | 'down' | 'up' = 'idle';
    let lastY = 0;
    let cooldown = false;

    const subscription = Accelerometer.addListener(({ y }) => {
      if (cooldown) return;

      const deltaY = y - lastY;
      lastY = y;

      // Detect downward motion (going into squat)
      if (phase === 'idle' && deltaY < -0.5) {
        phase = 'down';
      }
      // Detect upward motion (coming back up from squat)
      if (phase === 'down' && deltaY > 0.5) {
        phase = 'up';
        squatsRef.current++;
        setSquats(squatsRef.current);
        Vibration.vibrate(50);

        if (squatsRef.current >= target) {
          onComplete();
        }

        // Cooldown to prevent double counting
        cooldown = true;
        setTimeout(() => {
          cooldown = false;
          phase = 'idle';
        }, 600);
      }
    });

    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [target, onComplete]);

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.squats.title')}</Text>
      <Text style={[styles.instruction, { color: c.textSecondary }]}>
        {t('mission.squats.instruction')}
      </Text>
      <Text style={[styles.progressText, { color: c.text }]}>
        {t('mission.squats.progress', { current: squats, target })}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: c.success, width: `${Math.min(100, (squats / target) * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  instruction: { fontSize: 14, marginBottom: 20 },
  progressText: { fontSize: 32, fontWeight: '600', marginBottom: 20 },
  progressBar: { width: '80%', height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
});
