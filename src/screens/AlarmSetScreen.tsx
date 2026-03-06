import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useAlarms } from '../contexts/AlarmContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFreemium } from '../contexts/FreemiumContext';
import { RootStackParamList, Alarm, DayOfWeek, MissionType, MissionConfig } from '../utils/types';
import { scheduleAlarmNotification } from '../utils/notifications';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AlarmSet'>;

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MISSION_TYPES: MissionType[] = ['none', 'math', 'barcode', 'photo', 'steps', 'shake'];

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

  const [pickerDate, setPickerDate] = useState(() => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  });

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
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.timePickerContainer, { backgroundColor: c.surface }]}>
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            if (date) {
              setPickerDate(date);
              setHour(date.getHours());
              setMinute(date.getMinutes());
            }
          }}
          textColor={c.text}
          style={{ height: 150 }}
        />
      </View>

      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('alarmSet.label')}</Text>
        <TextInput
          style={[styles.input, { color: c.text, borderColor: c.border }]}
          placeholder={t('alarmSet.labelPlaceholder')}
          placeholderTextColor={c.textSecondary}
          value={label}
          onChangeText={setLabel}
        />
      </View>

      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('alarmSet.repeat')}</Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayBtn,
                { borderColor: c.border },
                days.includes(day) && { backgroundColor: c.primary, borderColor: c.primary },
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.dayText, { color: days.includes(day) ? '#FFF' : c.text }]}>
                {t(`alarmSet.days.${day}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: c.surface }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('alarmSet.mission')}</Text>
        <View style={styles.missionGrid}>
          {MISSION_TYPES.map((mt) => (
            <TouchableOpacity
              key={mt}
              style={[
                styles.missionBtn,
                { borderColor: c.border },
                missionType === mt && { backgroundColor: c.accent, borderColor: c.accent },
              ]}
              onPress={() => {
                if (!isMissionAvailable(mt)) {
                  Alert.alert(
                    t('freemium.proRequired'),
                    t('freemium.upgradeMessage'),
                  );
                  return;
                }
                setMissionType(mt);
              }}
            >
              <Text style={[styles.missionText, { color: missionType === mt ? '#FFF' : c.text }]}>
                {t(`alarmSet.missionTypes.${mt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {missionType === 'math' && (
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: c.text }]}>{t('alarmSet.difficulty')}</Text>
            <View style={styles.daysRow}>
              {([1, 2, 3] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dayBtn,
                    { borderColor: c.border },
                    mathDifficulty === d && { backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                  onPress={() => setMathDifficulty(d)}
                >
                  <Text style={{ color: mathDifficulty === d ? '#FFF' : c.text }}>
                    {t(`alarmSet.difficultyLevels.${d}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {missionType === 'steps' && (
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: c.text }]}>{t('alarmSet.stepsCount')}</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={[styles.stepperBtn, { borderColor: c.border }]} onPress={() => setStepsTarget(Math.max(10, stepsTarget - 10))}>
                <Text style={[styles.stepperText, { color: c.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: c.text }]}>{stepsTarget}</Text>
              <TouchableOpacity style={[styles.stepperBtn, { borderColor: c.border }]} onPress={() => setStepsTarget(Math.min(100, stepsTarget + 10))}>
                <Text style={[styles.stepperText, { color: c.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {missionType === 'shake' && (
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: c.text }]}>{t('alarmSet.shakeCount')}</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={[styles.stepperBtn, { borderColor: c.border }]} onPress={() => setShakeTarget(Math.max(10, shakeTarget - 10))}>
                <Text style={[styles.stepperText, { color: c.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: c.text }]}>{shakeTarget}</Text>
              <TouchableOpacity style={[styles.stepperBtn, { borderColor: c.border }]} onPress={() => setShakeTarget(Math.min(100, shakeTarget + 10))}>
                <Text style={[styles.stepperText, { color: c.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{t('common.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  timePickerContainer: { borderRadius: 12, padding: 8, marginBottom: 16, alignItems: 'center' },
  section: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  dayText: { fontSize: 14 },
  missionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  missionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  missionText: { fontSize: 13 },
  configRow: { marginTop: 16 },
  configLabel: { fontSize: 14, marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  stepperText: { fontSize: 20 },
  stepperValue: { fontSize: 20, fontWeight: '600', minWidth: 40, textAlign: 'center' },
  saveBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
