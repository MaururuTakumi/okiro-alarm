import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alarm, DayOfWeek } from './types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const dayMap: Record<DayOfWeek, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

export async function requestPermissions() {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarmNotification(alarm: Alarm) {
  if (Platform.OS === 'web') return;

  await cancelAlarmNotification(alarm.id);

  if (!alarm.enabled) return;

  const notificationData = {
    alarmId: alarm.id,
    missionType: alarm.missionType,
    missionConfig: alarm.missionConfig,
    preventSnooze: alarm.preventSnooze,
    payToSnooze: alarm.payToSnooze,
    snoozeCost: alarm.snoozeCost,
    repeatAlarm: alarm.repeatAlarm,
    repeatInterval: alarm.repeatInterval,
    maxRepeats: alarm.maxRepeats,
    repeatCount: 0,
  };

  if (alarm.days.length === 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: 'Time to wake up!',
        data: notificationData,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: alarm.hour,
        minute: alarm.minute,
      },
    });
  } else {
    for (const day of alarm.days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label || 'Alarm',
          body: 'Time to wake up!',
          data: notificationData,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayMap[day],
          hour: alarm.hour,
          minute: alarm.minute,
        },
      });
    }
  }
}

export async function cancelAlarmNotification(alarmId: string) {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.alarmId === alarmId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleRepeatNotification(alarm: Alarm, repeatCount: number) {
  if (Platform.OS === 'web') return;
  if (!alarm.repeatAlarm) return;
  if (alarm.maxRepeats !== -1 && repeatCount >= alarm.maxRepeats) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || 'Alarm',
      body: 'Time to wake up!',
      data: {
        alarmId: alarm.id,
        missionType: alarm.missionType,
        missionConfig: alarm.missionConfig,
        preventSnooze: alarm.preventSnooze,
        payToSnooze: alarm.payToSnooze,
        snoozeCost: alarm.snoozeCost,
        repeatAlarm: alarm.repeatAlarm,
        repeatInterval: alarm.repeatInterval,
        maxRepeats: alarm.maxRepeats,
        repeatCount: repeatCount + 1,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: alarm.repeatInterval * 60,
    },
  });
}

export async function cancelRepeatNotifications(alarmId: string) {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.alarmId === alarmId && notif.content.data?.repeatCount != null) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
