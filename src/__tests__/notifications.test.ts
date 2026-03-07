import * as Notifications from 'expo-notifications';
import { Alarm } from '../utils/types';
import {
  requestPermissions,
  scheduleAlarmNotification,
  cancelAlarmNotification,
  scheduleRepeatNotification,
  cancelRepeatNotifications,
} from '../utils/notifications';

const makeAlarm = (overrides: Partial<Alarm> = {}): Alarm => ({
  id: 'alarm-1',
  hour: 7,
  minute: 30,
  enabled: true,
  label: 'Test alarm',
  days: [],
  missionType: 'math',
  missionConfig: { mathDifficulty: 1 },
  sound: 'default',
  preventSnooze: false,
  repeatAlarm: false,
  repeatInterval: 3,
  maxRepeats: 3,
  ...overrides,
});

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should request notification permissions', async () => {
      const result = await requestPermissions();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('scheduleAlarmNotification', () => {
    it('should cancel existing and schedule new daily notification', async () => {
      const alarm = makeAlarm();
      await scheduleAlarmNotification(alarm);

      expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Test alarm',
            data: expect.objectContaining({
              alarmId: 'alarm-1',
              missionType: 'math',
            }),
          }),
          trigger: expect.objectContaining({
            type: 'daily',
            hour: 7,
            minute: 30,
          }),
        }),
      );
    });

    it('should schedule weekly notifications for specific days', async () => {
      const alarm = makeAlarm({ days: ['mon', 'wed', 'fri'] });
      await scheduleAlarmNotification(alarm);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    });

    it('should not schedule if alarm is disabled', async () => {
      const alarm = makeAlarm({ enabled: false });
      await scheduleAlarmNotification(alarm);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should include anti-snooze and repeat data', async () => {
      const alarm = makeAlarm({
        preventSnooze: true,
        repeatAlarm: true,
        repeatInterval: 5,
        maxRepeats: 10,
      });
      await scheduleAlarmNotification(alarm);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: expect.objectContaining({
              preventSnooze: true,
              repeatAlarm: true,
              repeatInterval: 5,
              maxRepeats: 10,
              repeatCount: 0,
            }),
          }),
        }),
      );
    });

    it('should include new mission types in notification data', async () => {
      const memoryAlarm = makeAlarm({
        missionType: 'memory',
        missionConfig: { memoryDifficulty: 2 },
      });
      await scheduleAlarmNotification(memoryAlarm);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: expect.objectContaining({
              missionType: 'memory',
              missionConfig: { memoryDifficulty: 2 },
            }),
          }),
        }),
      );
    });
  });

  describe('cancelAlarmNotification', () => {
    it('should cancel notifications matching the alarm ID', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'notif-1',
          content: { data: { alarmId: 'alarm-1' } },
        },
        {
          identifier: 'notif-2',
          content: { data: { alarmId: 'alarm-2' } },
        },
      ]);

      await cancelAlarmNotification('alarm-1');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('notif-2');
    });
  });

  describe('scheduleRepeatNotification', () => {
    it('should schedule repeat if repeatAlarm is true', async () => {
      const alarm = makeAlarm({ repeatAlarm: true, repeatInterval: 5, maxRepeats: 3 });
      await scheduleRepeatNotification(alarm, 1);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            type: 'timeInterval',
            seconds: 300,
          }),
        }),
      );
    });

    it('should not schedule if repeatAlarm is false', async () => {
      const alarm = makeAlarm({ repeatAlarm: false });
      await scheduleRepeatNotification(alarm, 0);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should not schedule if maxRepeats reached', async () => {
      const alarm = makeAlarm({ repeatAlarm: true, maxRepeats: 3 });
      await scheduleRepeatNotification(alarm, 3);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should schedule if maxRepeats is -1 (unlimited)', async () => {
      const alarm = makeAlarm({ repeatAlarm: true, maxRepeats: -1 });
      await scheduleRepeatNotification(alarm, 100);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('cancelRepeatNotifications', () => {
    it('should cancel only repeat notifications for the alarm', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'repeat-1',
          content: { data: { alarmId: 'alarm-1', repeatCount: 1 } },
        },
        {
          identifier: 'regular-1',
          content: { data: { alarmId: 'alarm-1' } },
        },
      ]);

      await cancelRepeatNotifications('alarm-1');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('repeat-1');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    });
  });
});
