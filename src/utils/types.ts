export type MissionType = 'none' | 'math' | 'barcode' | 'photo' | 'steps' | 'shake';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  days: DayOfWeek[];
  missionType: MissionType;
  missionConfig: MissionConfig;
  sound: string;
}

export interface MissionConfig {
  mathDifficulty?: 1 | 2 | 3;
  stepsTarget?: number;
  shakeTarget?: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Setup: undefined;
  MainTabs: undefined;
  AlarmSet: { alarmId?: string };
  Pro: undefined;
  Mission: { alarmId: string; missionType: MissionType; missionConfig: MissionConfig };
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};
