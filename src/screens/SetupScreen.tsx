import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/generateId';
import { useTheme } from '../contexts/ThemeContext';
import { useAlarms } from '../contexts/AlarmContext';
import { useFreemium } from '../contexts/FreemiumContext';
import { RootStackParamList, MissionType, MissionConfig, AlarmSound } from '../utils/types';
import { requestPermissions, scheduleAlarmNotification } from '../utils/notifications';
import WheelPicker from '../components/WheelPicker';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i,
}));
const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i,
}));

const MISSION_OPTIONS: { type: MissionType; icon: string; color: string }[] = [
  { type: 'math', icon: '+x', color: '#4ECDC4' },
  { type: 'shake', icon: '~', color: '#A78BFA' },
  { type: 'steps', icon: '^', color: '#F59E0B' },
  { type: 'none', icon: 'x', color: '#6B7280' },
];

const SETUP_COMPLETED_KEY = '@setup_completed';
const { width } = Dimensions.get('window');

export default function SetupScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { addAlarm } = useAlarms();
  const { isMissionAvailable } = useFreemium();

  const [step, setStep] = useState(1);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [missionType, setMissionType] = useState<MissionType>('math');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const totalSteps = 4;

  const handleNext = useCallback(async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const missionConfig: MissionConfig = {};
      if (missionType === 'math') missionConfig.mathDifficulty = 1;
      if (missionType === 'steps') missionConfig.stepsTarget = 30;
      if (missionType === 'shake') missionConfig.shakeTarget = 30;

      const alarm = {
        id: generateId(),
        hour,
        minute,
        enabled: true,
        label: '',
        days: [],
        missionType,
        missionConfig,
        sound: 'default' as AlarmSound,
        preventSnooze: false,
        payToSnooze: false,
        snoozeCost: 100,
        repeatAlarm: false,
        repeatInterval: 3,
        maxRepeats: 3,
      };

      try {
        addAlarm(alarm);
        await scheduleAlarmNotification(alarm).catch((e) => console.warn('Notif error:', e));
        await AsyncStorage.setItem(SETUP_COMPLETED_KEY, 'true');
      } catch (e) {
        console.warn('Setup alarm error:', e);
      }
      navigation.replace('Pro');
    }
  }, [step, hour, minute, missionType, addAlarm, navigation]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleAllowNotifications = useCallback(async () => {
    const granted = await requestPermissions();
    setPermissionGranted(granted !== false);
  }, []);

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: c.primary, width: `${(step / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={[styles.stepText, { color: c.textSecondary }]}>
        {t('setup.stepOf', { current: step, total: totalSteps })}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: c.text }]}>{t('setup.step1.title')}</Text>
      <Text style={[styles.stepSubtitle, { color: c.textSecondary }]}>
        {t('setup.step1.subtitle')}
      </Text>
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <WheelPicker
            items={HOURS}
            selectedValue={hour}
            onValueChange={setHour}
            textColor={c.textSecondary}
            selectedTextColor={c.text}
            highlightColor={c.surfaceElevated}
          />
        </View>
        <Text style={[styles.pickerSeparator, { color: c.text }]}>:</Text>
        <View style={styles.pickerColumn}>
          <WheelPicker
            items={MINUTES}
            selectedValue={minute}
            onValueChange={setMinute}
            textColor={c.textSecondary}
            selectedTextColor={c.text}
            highlightColor={c.surfaceElevated}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: c.text }]}>{t('setup.step2.title')}</Text>
      <Text style={[styles.stepSubtitle, { color: c.textSecondary }]}>
        {t('setup.step2.subtitle')}
      </Text>
      <View style={styles.missionList}>
        {MISSION_OPTIONS.map((m) => {
          const isSelected = missionType === m.type;
          const available = isMissionAvailable(m.type);
          return (
            <TouchableOpacity
              key={m.type}
              style={[
                styles.missionCard,
                { backgroundColor: c.surfaceElevated, borderColor: isSelected ? c.primary : c.border },
                isSelected && { borderWidth: 2 },
              ]}
              onPress={() => available && setMissionType(m.type)}
              activeOpacity={available ? 0.7 : 1}
            >
              <View style={[styles.missionIcon, { backgroundColor: m.color + '20' }]}>
                <Text style={[styles.missionIconText, { color: m.color }]}>{m.icon}</Text>
              </View>
              <Text style={[styles.missionName, { color: c.text }]}>
                {t(`alarmSet.missionTypes.${m.type}`)}
              </Text>
              {!available && (
                <View style={[styles.proBadge, { backgroundColor: c.primary }]}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: c.text }]}>{t('setup.step3.title')}</Text>
      <Text style={[styles.stepSubtitle, { color: c.textSecondary }]}>
        {t('setup.step3.subtitle')}
      </Text>

      <View style={styles.permissionSection}>
        <View style={[styles.permissionIcon, { backgroundColor: c.primary + '20' }]}>
          <Text style={{ fontSize: 40 }}>&#x1F514;</Text>
        </View>
        <Text style={[styles.permissionDesc, { color: c.textSecondary }]}>
          {t('setup.step3.description')}
        </Text>
        <TouchableOpacity
          style={[
            styles.permissionButton,
            { backgroundColor: permissionGranted ? c.success : c.primary },
          ]}
          onPress={handleAllowNotifications}
          disabled={permissionGranted}
        >
          <Text style={styles.permissionButtonText}>
            {permissionGranted ? t('setup.step3.allowed') : t('setup.step3.allowButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={[styles.stepContent, styles.centerContent]}>
      <View style={[styles.welcomeCircle, { backgroundColor: c.primary + '15' }]}>
        <Text style={styles.welcomeEmoji}>&#x2600;&#xFE0F;</Text>
      </View>
      <Text style={[styles.stepTitle, { color: c.text }]}>{t('setup.step4.title')}</Text>
      <Text style={[styles.stepSubtitle, { color: c.textSecondary }]}>
        {t('setup.step4.subtitle')}
      </Text>
      <View style={[styles.alarmPreview, { backgroundColor: c.surfaceElevated }]}>
        <Text style={[styles.previewTime, { color: c.primary }]}>
          {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
        </Text>
        <Text style={[styles.previewMission, { color: c.textSecondary }]}>
          {t(`alarmSet.missionTypes.${missionType}`)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {renderProgressBar()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <View style={styles.bottomSection}>
        {step > 1 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: c.textSecondary }]}>{t('setup.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: c.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === totalSteps ? t('setup.step4.finishButton') : t('setup.next')}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  pickerColumn: {
    width: 100,
  },
  pickerSeparator: {
    fontSize: 32,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  missionList: {
    gap: 12,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  missionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  missionIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  missionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  permissionSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeEmoji: {
    fontSize: 50,
  },
  alarmPreview: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    marginTop: 16,
  },
  previewTime: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 2,
  },
  previewMission: {
    fontSize: 14,
    marginTop: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 30 : 50,
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    marginBottom: 12,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
