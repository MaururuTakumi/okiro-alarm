import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../utils/types';
import { cancelAlarmNotification } from '../utils/notifications';
import { MathMission, BarcodeMission, PhotoMission, StepsMission, ShakeMission } from '../components/missions';

type Route = RouteProp<RootStackParamList, 'Mission'>;

export default function MissionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { missionType, missionConfig } = route.params;
  const [completed, setCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    setCompleted(true);
    Vibration.vibrate([0, 200, 100, 200]);
    cancelAlarmNotification(route.params.alarmId);
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }, [navigation, route.params.alarmId]);

  if (completed) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.completedText, { color: c.success }]}>{t('mission.completed')}</Text>
        <Text style={[styles.stoppedText, { color: c.textSecondary }]}>{t('mission.alarmStopped')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.headerText, { color: c.accent }]}>{t('mission.title')}</Text>
      {missionType === 'math' && (
        <MathMission difficulty={missionConfig.mathDifficulty ?? 1} onComplete={handleComplete} />
      )}
      {missionType === 'barcode' && <BarcodeMission onComplete={handleComplete} />}
      {missionType === 'photo' && <PhotoMission onComplete={handleComplete} />}
      {missionType === 'steps' && (
        <StepsMission target={missionConfig.stepsTarget ?? 30} onComplete={handleComplete} />
      )}
      {missionType === 'shake' && (
        <ShakeMission target={missionConfig.shakeTarget ?? 30} onComplete={handleComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20, marginTop: 40 },
  completedText: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  stoppedText: { fontSize: 16 },
});
