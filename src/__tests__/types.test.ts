import { MissionType, AlarmSound, Alarm, MissionConfig, DayOfWeek } from '../utils/types';

describe('Types', () => {
  describe('MissionType', () => {
    it('should include all 9 mission types', () => {
      const allTypes: MissionType[] = [
        'none', 'math', 'barcode', 'photo', 'steps', 'shake', 'memory', 'typing', 'squats',
      ];
      // Verify each type is assignable
      allTypes.forEach((type) => {
        const t: MissionType = type;
        expect(t).toBe(type);
      });
    });
  });

  describe('AlarmSound', () => {
    it('should include all 8 sound types', () => {
      const allSounds: AlarmSound[] = [
        'default', 'gentle', 'energetic', 'nature', 'bell', 'digital', 'melody', 'vibrate',
      ];
      allSounds.forEach((sound) => {
        const s: AlarmSound = sound;
        expect(s).toBe(sound);
      });
    });
  });

  describe('MissionConfig', () => {
    it('should support all config options', () => {
      const config: MissionConfig = {
        mathDifficulty: 2,
        stepsTarget: 50,
        shakeTarget: 40,
        memoryDifficulty: 3,
        typingDifficulty: 1,
        squatsTarget: 15,
      };
      expect(config.mathDifficulty).toBe(2);
      expect(config.memoryDifficulty).toBe(3);
      expect(config.typingDifficulty).toBe(1);
      expect(config.squatsTarget).toBe(15);
    });

    it('should allow partial config', () => {
      const config: MissionConfig = {};
      expect(config.mathDifficulty).toBeUndefined();
      expect(config.memoryDifficulty).toBeUndefined();
    });
  });

  describe('Alarm', () => {
    it('should have all required properties', () => {
      const alarm: Alarm = {
        id: 'test-id',
        hour: 7,
        minute: 30,
        enabled: true,
        label: 'Wake up',
        days: ['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[],
        missionType: 'math',
        missionConfig: { mathDifficulty: 2 },
        sound: 'default',
        preventSnooze: false,
        repeatAlarm: true,
        repeatInterval: 3,
        maxRepeats: 5,
      };
      expect(alarm.id).toBe('test-id');
      expect(alarm.missionType).toBe('math');
      expect(alarm.sound).toBe('default');
      expect(alarm.preventSnooze).toBe(false);
      expect(alarm.repeatAlarm).toBe(true);
    });

    it('should support new mission types in alarm', () => {
      const memoryAlarm: Alarm = {
        id: 'mem-1',
        hour: 6,
        minute: 0,
        enabled: true,
        label: '',
        days: [],
        missionType: 'memory',
        missionConfig: { memoryDifficulty: 2 },
        sound: 'gentle',
        preventSnooze: true,
        repeatAlarm: false,
        repeatInterval: 3,
        maxRepeats: 3,
      };
      expect(memoryAlarm.missionType).toBe('memory');

      const typingAlarm: Alarm = {
        ...memoryAlarm,
        id: 'typ-1',
        missionType: 'typing',
        missionConfig: { typingDifficulty: 3 },
      };
      expect(typingAlarm.missionType).toBe('typing');

      const squatsAlarm: Alarm = {
        ...memoryAlarm,
        id: 'sqt-1',
        missionType: 'squats',
        missionConfig: { squatsTarget: 20 },
      };
      expect(squatsAlarm.missionType).toBe('squats');
    });
  });
});
