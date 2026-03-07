import en from '../locales/en.json';
import ja from '../locales/ja.json';
import zh from '../locales/zh.json';
import ko from '../locales/ko.json';

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.keys(obj).reduce<string[]>((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return acc.concat(flattenKeys(obj[key], fullKey));
    }
    return acc.concat(fullKey);
  }, []);
}

describe('Translation completeness', () => {
  const enKeys = flattenKeys(en).sort();

  it('en.json should have all expected mission type keys', () => {
    const missionTypes = [
      'alarmSet.missionTypes.none',
      'alarmSet.missionTypes.math',
      'alarmSet.missionTypes.barcode',
      'alarmSet.missionTypes.photo',
      'alarmSet.missionTypes.steps',
      'alarmSet.missionTypes.shake',
      'alarmSet.missionTypes.memory',
      'alarmSet.missionTypes.typing',
      'alarmSet.missionTypes.squats',
    ];
    missionTypes.forEach((key) => {
      expect(enKeys).toContain(key);
    });
  });

  it('en.json should have all new mission translation keys', () => {
    const newMissionKeys = [
      'mission.memory.title',
      'mission.memory.moves',
      'mission.memory.pairs',
      'mission.typing.title',
      'mission.typing.instruction',
      'mission.typing.placeholder',
      'mission.typing.progress',
      'mission.squats.title',
      'mission.squats.instruction',
      'mission.squats.progress',
      'alarmSet.squatsCount',
    ];
    newMissionKeys.forEach((key) => {
      expect(enKeys).toContain(key);
    });
  });

  it('ja.json should have all keys from en.json', () => {
    const jaKeys = flattenKeys(ja).sort();
    const missingInJa = enKeys.filter((key) => !jaKeys.includes(key));
    expect(missingInJa).toEqual([]);
  });

  it('zh.json should have all keys from en.json', () => {
    const zhKeys = flattenKeys(zh).sort();
    const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));
    expect(missingInZh).toEqual([]);
  });

  it('ko.json should have all keys from en.json', () => {
    const koKeys = flattenKeys(ko).sort();
    const missingInKo = enKeys.filter((key) => !koKeys.includes(key));
    expect(missingInKo).toEqual([]);
  });

  it('all locales should have the same number of keys', () => {
    const jaKeys = flattenKeys(ja);
    const zhKeys = flattenKeys(zh);
    const koKeys = flattenKeys(ko);
    expect(jaKeys.length).toBe(enKeys.length);
    expect(zhKeys.length).toBe(enKeys.length);
    expect(koKeys.length).toBe(enKeys.length);
  });

  it('should have onboarding section in all locales', () => {
    expect(en).toHaveProperty('onboarding');
    expect(ja).toHaveProperty('onboarding');
    expect(zh).toHaveProperty('onboarding');
    expect(ko).toHaveProperty('onboarding');
  });

  it('should have setup section in all locales', () => {
    expect(en).toHaveProperty('setup');
    expect(ja).toHaveProperty('setup');
    expect(zh).toHaveProperty('setup');
    expect(ko).toHaveProperty('setup');
  });

  it('should have pro section in all locales', () => {
    expect(en).toHaveProperty('pro');
    expect(ja).toHaveProperty('pro');
    expect(zh).toHaveProperty('pro');
    expect(ko).toHaveProperty('pro');
  });
});
