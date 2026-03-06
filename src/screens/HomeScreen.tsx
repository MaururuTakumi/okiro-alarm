import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAlarms } from '../contexts/AlarmContext';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList, Alarm } from '../utils/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { alarms, toggleAlarm, deleteAlarm } = useAlarms();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const c = theme.colors;

  const fabShadowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabShadowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(fabShadowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fabShadowAnim]);

  const fabShadowRadius = fabShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 18],
  });

  const fabShadowOpacity = fabShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.55],
  });

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const sortedAlarms = useMemo(
    () => [...alarms].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)),
    [alarms],
  );

  const nextAlarm = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const enabled = sortedAlarms.filter((a) => a.enabled);
    if (enabled.length === 0) return null;

    const future = enabled.find((a) => a.hour * 60 + a.minute > nowMin);
    const target = future || enabled[0];
    let targetMin = target.hour * 60 + target.minute;
    if (targetMin <= nowMin) targetMin += 24 * 60;
    const diff = targetMin - nowMin;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { alarm: target, hours, mins };
  }, [sortedAlarms]);

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      deleteAlarm(id);
      return;
    }
    Alert.alert(t('common.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteAlarm(id) },
    ]);
  };

  const renderAlarm = ({ item }: { item: Alarm }) => {
    const isEnabled = item.enabled;
    return (
      <TouchableOpacity
        style={[styles.alarmCard, { backgroundColor: c.cardBackground }]}
        onPress={() => navigation.navigate('AlarmSet', { alarmId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.alarmLeft}>
          <Text
            style={[
              styles.timeText,
              { color: isEnabled ? c.text : c.textMuted },
            ]}
          >
            {formatTime(item.hour, item.minute)}
          </Text>
          <View style={styles.alarmMeta}>
            {item.label ? (
              <Text style={[styles.labelText, { color: c.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            ) : null}
            <Text style={[styles.missionBadge, { color: c.primary, backgroundColor: c.primary + '15' }]}>
              {t(`alarmSet.missionTypes.${item.missionType}`)}
            </Text>
          </View>
          {item.days.length > 0 && (
            <View style={styles.daysRow}>
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((d) => (
                <Text
                  key={d}
                  style={[
                    styles.dayDot,
                    { color: item.days.includes(d) ? c.primary : c.textMuted },
                    item.days.includes(d) && { fontWeight: '700' },
                  ]}
                >
                  {t(`alarmSet.days.${d}`)}
                </Text>
              ))}
            </View>
          )}
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleAlarm(item.id)}
          trackColor={{ false: c.border, true: c.primary + '80' }}
          thumbColor={isEnabled ? c.primary : c.textMuted}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header gradient-like background */}
      <View style={[styles.headerGradient, { backgroundColor: c.primary }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Okiro</Text>
        {nextAlarm && (
          <View style={[styles.countdownBadge, { backgroundColor: c.surfaceElevated }]}>
            <Text style={[styles.countdownText, { color: c.primary }]}>
              {nextAlarm.hours > 0 ? `${nextAlarm.hours}h ` : ''}{nextAlarm.mins}m
            </Text>
          </View>
        )}
      </View>

      {/* Countdown Banner */}
      {nextAlarm && (
        <View style={[styles.countdownBanner, { backgroundColor: c.surfaceElevated, borderColor: c.primary + '30', borderWidth: 1 }]}>
          <View style={styles.countdownLeft}>
            <Text style={[styles.countdownLabel, { color: c.textSecondary }]}>
              {t('home.nextAlarm')}
            </Text>
            <Text style={[styles.countdownTime, { color: c.text }]}>
              {formatTime(nextAlarm.alarm.hour, nextAlarm.alarm.minute)}
            </Text>
          </View>
          <View style={[styles.countdownDivider, { backgroundColor: c.primary + '40' }]} />
          <View style={styles.countdownRight}>
            <Text style={[styles.countdownRemaining, { color: c.primary }]}>
              {nextAlarm.hours > 0 ? `${nextAlarm.hours}h ` : ''}{nextAlarm.mins}m
            </Text>
            <Text style={[styles.countdownRemainingLabel, { color: c.textSecondary }]}>
              {t('home.remaining')}
            </Text>
          </View>
        </View>
      )}

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconOuter, { backgroundColor: c.primary + '08' }]}>
            <View style={[styles.emptyIcon, { backgroundColor: c.surfaceElevated }]}>
              <Text style={{ fontSize: 48 }}>&#x23F0;</Text>
            </View>
          </View>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t('home.noAlarms')}</Text>
          <Text style={[styles.emptyHint, { color: c.textMuted }]}>{t('home.addHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedAlarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarm}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: c.primary,
            shadowColor: c.primary,
            shadowRadius: fabShadowRadius,
            shadowOpacity: fabShadowOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabTouchable}
          onPress={() => navigation.navigate('AlarmSet', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 80 : 120,
    opacity: 0.06,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 60,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countdownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  countdownBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownLeft: {
    flex: 1,
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 1,
  },
  countdownDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 18,
  },
  countdownRight: {
    alignItems: 'center',
  },
  countdownRemaining: {
    fontSize: 22,
    fontWeight: '700',
  },
  countdownRemainingLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  list: { padding: 16, paddingBottom: 100 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 17, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  emptyHint: { fontSize: 14 },
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginBottom: 10,
    borderRadius: 16,
  },
  alarmLeft: { flex: 1, marginRight: 12 },
  timeText: {
    fontSize: 42,
    fontWeight: '200',
    letterSpacing: 1,
  },
  alarmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  labelText: {
    fontSize: 14,
    maxWidth: 140,
  },
  missionBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dayDot: {
    fontSize: 11,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { color: '#FFF', fontSize: 30, lineHeight: 32 },
});
