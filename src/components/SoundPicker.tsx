import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { AlarmSound } from '../utils/types';

const SOUND_OPTIONS: { id: AlarmSound; icon: string }[] = [
  { id: 'default', icon: '\u{1F50A}' },
  { id: 'gentle', icon: '\u{1F33F}' },
  { id: 'energetic', icon: '\u{26A1}' },
  { id: 'nature', icon: '\u{1F333}' },
  { id: 'bell', icon: '\u{1F514}' },
  { id: 'digital', icon: '\u{1F4F1}' },
  { id: 'melody', icon: '\u{1F3B5}' },
  { id: 'vibrate', icon: '\u{1F4F3}' },
];

interface SoundPickerProps {
  selectedSound: AlarmSound;
  onSelectSound: (sound: AlarmSound) => void;
}

export default function SoundPicker({ selectedSound, onSelectSound }: SoundPickerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [previewingId, setPreviewingId] = useState<AlarmSound | null>(null);

  const handlePress = useCallback(
    (soundId: AlarmSound) => {
      onSelectSound(soundId);

      // Visual feedback + vibration as placeholder for sound preview
      setPreviewingId(soundId);
      Vibration.vibrate(soundId === 'vibrate' ? [0, 100, 50, 100] : 50);
      setTimeout(() => setPreviewingId(null), 400);
    },
    [onSelectSound],
  );

  return (
    <View style={styles.list}>
      {SOUND_OPTIONS.map((option) => {
        const isSelected = selectedSound === option.id;
        const isPreviewing = previewingId === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.item,
              {
                backgroundColor: c.surfaceElevated,
                borderColor: isSelected ? c.primary : c.border,
                borderWidth: isSelected ? 2 : 1,
              },
              isPreviewing && { opacity: 0.7 },
            ]}
            onPress={() => handlePress(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: isSelected ? c.primary + '20' : c.surface }]}>
              <Text style={styles.icon}>{option.icon}</Text>
            </View>
            <Text
              style={[
                styles.soundName,
                { color: isSelected ? c.text : c.textSecondary },
                isSelected && styles.soundNameActive,
              ]}
              numberOfLines={1}
            >
              {t(`alarmSet.soundTypes.${option.id}`)}
            </Text>
            {isSelected && (
              <Text style={[styles.checkmark, { color: c.primary }]}>{'\u2713'}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  soundName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  soundNameActive: {
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
