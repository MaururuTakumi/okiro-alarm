import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Vibration, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../utils/types';
import { cancelAlarmNotification } from '../utils/notifications';
import { paymentService } from '../services/PaymentService';
import { MathMission, BarcodeMission, PhotoMission, StepsMission, ShakeMission, MemoryMission, TypingMission, SquatsMission } from '../components/missions';

type Route = RouteProp<RootStackParamList, 'Mission'>;

export default function MissionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { missionType, missionConfig, preventSnooze, payToSnooze, snoozeCost } = route.params;
  const [completed, setCompleted] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [charging, setCharging] = useState(false);

  const costAmount = snoozeCost ?? 100;

  const handleComplete = useCallback(() => {
    setCompleted(true);
    Vibration.vibrate([0, 200, 100, 200]);
    cancelAlarmNotification(route.params.alarmId);
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }, [navigation, route.params.alarmId]);

  const handleSnooze = useCallback(() => {
    if (payToSnooze) {
      setShowPayConfirm(true);
    } else {
      performSnooze();
    }
  }, [payToSnooze]);

  const performSnooze = useCallback(() => {
    setSnoozed(true);
    cancelAlarmNotification(route.params.alarmId);
    // TODO: Schedule a new notification 5 minutes from now
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }, [navigation, route.params.alarmId]);

  const handlePayAndSnooze = useCallback(async () => {
    setCharging(true);
    const success = await paymentService.chargeSnooze(
      costAmount,
      route.params.alarmId,
    );
    setCharging(false);

    if (success) {
      setShowPayConfirm(false);
      performSnooze();
    }
    // If charge fails, stay on confirm screen so user can retry or go back
  }, [performSnooze, costAmount, route.params.alarmId]);

  if (snoozed) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.completedText, { color: c.primary }]}>{t('mission.snoozed')}</Text>
        <Text style={[styles.stoppedText, { color: c.textSecondary }]}>{t('mission.snoozedSub')}</Text>
        {payToSnooze && (
          <Text style={[styles.paidText, { color: c.accent }]}>
            {t('mission.paidSnooze', { amount: costAmount })}
          </Text>
        )}
      </View>
    );
  }

  if (completed) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.completedText, { color: c.success }]}>{t('mission.completed')}</Text>
        <Text style={[styles.stoppedText, { color: c.textSecondary }]}>{t('mission.alarmStopped')}</Text>
      </View>
    );
  }

  // Pay to Snooze confirmation overlay
  if (showPayConfirm) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.headerText, { color: c.accent }]}>{t('mission.title')}</Text>

        <View style={styles.payOverlay}>
          <View style={[styles.payCard, { backgroundColor: c.surfaceElevated }]}>
            <Text style={[styles.payTitle, { color: c.text }]}>{t('mission.paySnoozeTitle')}</Text>
            <Text style={[styles.payCost, { color: c.primary }]}>
              {t('alarmSet.snoozeCostValue', { amount: costAmount })}
            </Text>
            <Text style={[styles.payDesc, { color: c.textSecondary }]}>
              {t('mission.paySnoozeDesc')}
            </Text>

            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: c.primary, opacity: charging ? 0.7 : 1 }]}
              onPress={handlePayAndSnooze}
              activeOpacity={0.8}
              disabled={charging}
            >
              {charging ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.payButtonText}>
                  {t('mission.payAndSnooze', { amount: costAmount })}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelPayButton}
              onPress={() => setShowPayConfirm(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelPayText, { color: c.textSecondary }]}>
                {t('mission.doMissionInstead')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const showSnoozeButton = !preventSnooze;

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
      {missionType === 'memory' && (
        <MemoryMission difficulty={missionConfig.memoryDifficulty ?? 1} onComplete={handleComplete} />
      )}
      {missionType === 'typing' && (
        <TypingMission difficulty={missionConfig.typingDifficulty ?? 1} onComplete={handleComplete} />
      )}
      {missionType === 'squats' && (
        <SquatsMission target={missionConfig.squatsTarget ?? 10} onComplete={handleComplete} />
      )}

      {/* Snooze Button */}
      {showSnoozeButton && (
        <View style={styles.snoozeSection}>
          <TouchableOpacity
            style={[
              styles.snoozeButton,
              {
                backgroundColor: payToSnooze ? 'transparent' : c.surfaceElevated,
                borderColor: payToSnooze ? c.primary : c.border,
                borderWidth: payToSnooze ? 2 : 1,
              },
            ]}
            onPress={handleSnooze}
            activeOpacity={0.7}
          >
            {payToSnooze ? (
              <View style={styles.snoozeInner}>
                <Text style={[styles.snoozeText, { color: c.primary }]}>
                  {t('mission.snoozeFor', { amount: costAmount })}
                </Text>
                <Text style={[styles.snoozeSub, { color: c.textSecondary }]}>
                  {t('mission.snooze5min')}
                </Text>
              </View>
            ) : (
              <View style={styles.snoozeInner}>
                <Text style={[styles.snoozeText, { color: c.textSecondary }]}>
                  {t('mission.snooze')}
                </Text>
                <Text style={[styles.snoozeSub, { color: c.textMuted }]}>
                  {t('mission.snooze5min')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
  paidText: { fontSize: 14, marginTop: 12, fontWeight: '600' },

  // Snooze
  snoozeSection: {
    paddingBottom: Platform.OS === 'web' ? 20 : 40,
    paddingTop: 12,
  },
  snoozeButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  snoozeInner: {
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  snoozeSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Pay confirmation overlay
  payOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  payCard: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  payTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  payCost: {
    fontSize: 48,
    fontWeight: '200',
    marginBottom: 12,
  },
  payDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  payButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelPayButton: {
    padding: 12,
  },
  cancelPayText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
