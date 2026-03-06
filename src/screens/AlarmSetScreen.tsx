import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useAlarms } from '../contexts/AlarmContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFreemium } from '../contexts/FreemiumContext';
import { RootStackParamList, Alarm, DayOfWeek, MissionType, MissionConfig } from '../utils/types';
import { scheduleAlarmNotification } from '../utils/notifications';
import WheelPicker from '../components/WheelPicker';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AlarmSet'>;

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MISSION_TYPES: MissionType[] = ['none', 'math', 'barcode', 'photo', 'steps', 'shake'];

const MISSION_ICONS: Record<MissionType, string> = {
  none: '',
  math: '',
  barcode: '',
  photo: '',
  steps: '',
  shake: '',
};

export default function AlarmSetScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { addAlarm, updateAlarm, getAlarm } = useAlarms();
  const { theme } = useTheme();
  const c = theme.colors;
  const { isPro, isMissionAvailable } = useFreemium();

  const editingId = route.params?.alarmId;
  const existing = editingId ? getAlarm(editingId) : undefined;

  const [hour, setHour] = useState(existing?.hour ?? new Date().getHours());
  const [minute, setMinute] = useState(existing?.minute ?? 0);
  const [label, setLabel] = useState(existing?.label ?? '');
  const [days, setDays] = useState<DayOfWeek[]>(existing?.days ?? []);
  const [missionType, setMissionType] = useState<MissionType>(existing?.missionType ?? 'none');
  const [mathDifficulty, setMathDifficulty] = useState<1 | 2 | 3>(existing?.missionConfig?.mathDifficulty ?? 1);
  const [stepsTarget, setStepsTarget] = useState(existing?.missionConfig?.stepsTarget ?? 30);
  const [shakeTarget, setShakeTarget] = useState(existing?.missionConfig?.shakeTarget ?? 30);

  const hourItems = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, '0'),
        value: i,
      })),
    [],
  );

  const minuteItems = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        label: i.toString().padStart(2, '0'),
        value: i,
      })),
    [],
  );

  const toggleDay = (day: DayOfWeek) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSave = async () => {
    const missionConfig: MissionConfig = {};
    if (missionType === 'math') missionConfig.mathDifficulty = mathDifficulty;
    if (missionType === 'steps') missionConfig.stepsTarget = stepsTarget;
    if (missionType === 'shake') missionConfig.shakeTarget = shakeTarget;

    const alarm: Alarm = {
      id: editingId ?? uuidv4(),
      hour,
      minute,
      enabled: existing?.enabled ?? true,
      label,
      days,
      missionType,
      missionConfig,
      sound: 'default',
    };

    if (editingId) {
      updateAlarm(alarm);
    } else {
      addAlarm(alarm);
    }

    await scheduleAlarmNotification(alarm);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Time Picker Section */}
      <View style={[styles.timeSection, { backgroundColor: c.surface }]}>
        <View style={styles.timePickerRow}>
          <View style={styles.wheelColumn}>
            <WheelPicker
              items={hourItems}
              selectedValue={hour}
              onValueChange={setHour}
              textColor={c.textSecondary}
              selectedTextColor={c.text}
              highlightColor={`${c.primary}22`}
            />
          </View>
          <View style={styles.separatorContainer}>
            <Text style={[styles.timeSeparator, { color: c.primary }]}>:</Text>
          </View>
          <View style={styles.wheelColumn}>
            <WheelPicker
              items={minuteItems}
              selectedValue={minute}
              onValueChange={setMinute}
              textColor={c.textSecondary}
              selectedTextColor={c.text}
              highlightColor={`${c.primary}22`}
            />
          </View>
        </View>
      </View>

      {/* Label Section */}
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
          {t('alarmSet.label')}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: c.text,
              backgroundColor: c.surfaceElevated,
              borderColor: c.border,
            },
          ]}
          placeholder={t('alarmSet.labelPlaceholder')}
          placeholderTextColor={c.textMuted}
          value={label}
          onChangeText={setLabel}
        />
      </View>

      {/* Repeat Days Section */}
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
          {t('alarmSet.repeat')}
        </Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map((day) => {
            const active = days.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  { backgroundColor: c.surfaceElevated, borderColor: c.border },
                  active && { backgroundColor: c.primary, borderColor: c.primary },
                ]}
                onPress={() => toggleDay(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    { color: active ? '#FFFFFF' : c.textSecondary },
                    active && styles.dayChipTextActive,
                  ]}
                >
                  {t(`alarmSet.days.${day}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Mission Section */}
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
          {t('alarmSet.mission')}
        </Text>
        <View style={styles.missionGrid}>
          {MISSION_TYPES.map((mt) => {
            const active = missionType === mt;
            const available = isMissionAvailable(mt);
            return (
              <TouchableOpacity
                key={mt}
                style={[
                  styles.missionCard,
                  { backgroundColor: c.surfaceElevated, borderColor: c.border },
                  active && {
                    backgroundColor: c.primary,
                    borderColor: c.primary,
                  },
                ]}
                onPress={() => {
                  if (!available) {
                    Alert.alert(
                      t('freemium.proRequired'),
                      t('freemium.upgradeMessage'),
                    );
                    return;
                  }
                  setMissionType(mt);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.missionLabel,
                    { color: active ? '#FFFFFF' : c.text },
                  ]}
                >
                  {t(`alarmSet.missionTypes.${mt}`)}
                </Text>
                {!available && (
                  <View style={[styles.proBadge, { backgroundColor: c.accent }]}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Math Difficulty Config */}
        {missionType === 'math' && (
          <View style={styles.configSection}>
            <Text style={[styles.configLabel, { color: c.textSecondary }]}>
              {t('alarmSet.difficulty')}
            </Text>
            <View style={styles.configOptionsRow}>
              {([1, 2, 3] as const).map((d) => {
                const active = mathDifficulty === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.configOption,
                      { backgroundColor: c.surfaceElevated, borderColor: c.border },
                      active && { backgroundColor: c.primary, borderColor: c.primary },
                    ]}
                    onPress={() => setMathDifficulty(d)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.configOptionText,
                        { color: active ? '#FFFFFF' : c.text },
                      ]}
                    >
                      {t(`alarmSet.difficultyLevels.${d}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Steps Config */}
        {missionType === 'steps' && (
          <View style={styles.configSection}>
            <Text style={[styles.configLabel, { color: c.textSecondary }]}>
              {t('alarmSet.stepsCount')}
            </Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}
                onPress={() => setStepsTarget(Math.max(10, stepsTarget - 10))}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepperBtnText, { color: c.primary }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.stepperValueContainer, { backgroundColor: c.surfaceElevated }]}>
                <Text style={[styles.stepperValue, { color: c.text }]}>{stepsTarget}</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}
                onPress={() => setStepsTarget(Math.min(100, stepsTarget + 10))}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepperBtnText, { color: c.primary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shake Config */}
        {missionType === 'shake' && (
          <View style={styles.configSection}>
            <Text style={[styles.configLabel, { color: c.textSecondary }]}>
              {t('alarmSet.shakeCount')}
            </Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}
                onPress={() => setShakeTarget(Math.max(10, shakeTarget - 10))}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepperBtnText, { color: c.primary }]}>-</Text>
              </TouchableOpacity>
              <View style={[styles.stepperValueContainer, { backgroundColor: c.surfaceElevated }]}>
                <Text style={[styles.stepperValue, { color: c.text }]}>{shakeTarget}</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}
                onPress={() => setShakeTarget(Math.min(100, shakeTarget + 10))}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepperBtnText, { color: c.primary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: c.primary }]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },

  // Time Picker
  timeSection: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelColumn: {
    width: 100,
  },
  separatorContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: '700',
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Label Input
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },

  // Days
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dayChipTextActive: {
    fontWeight: '700',
  },

  // Mission
  missionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missionCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    position: 'relative',
  },
  missionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  proBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Config
  configSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  configOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  configOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '600',
  },
  stepperValueContainer: {
    minWidth: 64,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Save Button
  saveButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
