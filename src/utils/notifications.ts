import * as Notifications from 'expo-notifications';
import { Alarm, DayOfWeek } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarmNotification(alarm: Alarm) {
  await cancelAlarmNotification(alarm.id);

  if (!alarm.enabled) return;

  if (alarm.days.length === 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: 'Time to wake up!',
        data: { alarmId: alarm.id, missionType: alarm.missionType, missionConfig: alarm.missionConfig },
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
          data: { alarmId: alarm.id, missionType: alarm.missionType, missionConfig: alarm.missionConfig },
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
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.alarmId === alarmId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
