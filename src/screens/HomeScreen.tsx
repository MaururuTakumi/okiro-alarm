import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
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

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const handleDelete = (id: string) => {
    Alert.alert(t('common.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteAlarm(id) },
    ]);
  };

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <TouchableOpacity
      style={[styles.alarmCard, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={() => navigation.navigate('AlarmSet', { alarmId: item.id })}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.alarmInfo}>
        <Text style={[styles.timeText, { color: item.enabled ? c.text : c.textSecondary }]}>
          {formatTime(item.hour, item.minute)}
        </Text>
        <Text style={[styles.labelText, { color: c.textSecondary }]}>
          {item.label || t(`alarmSet.missionTypes.${item.missionType}`)}
        </Text>
        {item.days.length > 0 && (
          <Text style={[styles.daysText, { color: c.textSecondary }]}>
            {item.days.map((d) => t(`alarmSet.days.${d}`)).join(' ')}
          </Text>
        )}
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleAlarm(item.id)}
        trackColor={{ false: c.border, true: c.primary }}
        thumbColor={c.surface}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t('home.noAlarms')}</Text>
        </View>
      ) : (
        <FlatList
          data={alarms.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarm}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('AlarmSet', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alarmInfo: { flex: 1 },
  timeText: { fontSize: 40, fontWeight: '300' },
  labelText: { fontSize: 14, marginTop: 4 },
  daysText: { fontSize: 12, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 30 },
});
