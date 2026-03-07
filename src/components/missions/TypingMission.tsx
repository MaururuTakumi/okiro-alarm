import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  difficulty: number;
  onComplete: () => void;
}

const PHRASES_EN: Record<number, string[]> = {
  1: [
    'Good morning sunshine',
    'Rise and shine today',
    'Time to wake up now',
    'Start your day strong',
    'Today will be great',
  ],
  2: [
    'The early bird catches the worm every single morning',
    'Every morning is a chance to start something new and fresh',
    'Success comes to those who wake up early and work hard',
  ],
  3: [
    'The difference between ordinary and extraordinary is that little extra effort you put in every single morning when you choose to rise',
    'Waking up early is not about sleeping less but about living more and making the most of every precious moment of your day',
  ],
};

const PHRASES_JA: Record<number, string[]> = {
  1: [
    'おはようございます',
    '今日も一日がんばろう',
    '朝の光を浴びよう',
    '素敵な一日の始まり',
    '目覚めの時間です',
  ],
  2: [
    '早起きは三文の徳という言葉は本当です',
    '毎朝の小さな努力が大きな成果につながります',
    '今日という日は二度と来ない大切な一日です',
  ],
  3: [
    '朝早く起きることは人生を変える最も簡単な方法の一つです。毎日の積み重ねが未来の自分を作ります。さあ今日も元気に一日を始めましょう。',
    '成功する人の共通点は朝の時間を大切にすることです。静かな朝の時間は集中力を高め、一日の準備を整える最高の時間です。',
  ],
};

export default function TypingMission({ difficulty, onComplete }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  const targetText = useMemo(() => {
    const phrases = i18n.language === 'ja' ? PHRASES_JA : PHRASES_EN;
    const list = phrases[difficulty] ?? phrases[1]!;
    return list[Math.floor(Math.random() * list.length)];
  }, [difficulty, i18n.language]);

  const [input, setInput] = useState('');

  const handleChange = (text: string) => {
    setInput(text);
    if (text === targetText) {
      onComplete();
    }
  };

  const renderHighlightedTarget = () => {
    return targetText.split('').map((char, index) => {
      let color = c.textSecondary;
      if (index < input.length) {
        color = input[index] === char ? c.success : c.danger;
      }
      return (
        <Text key={index} style={[styles.highlightChar, { color }]}>
          {char}
        </Text>
      );
    });
  };

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.typing.title')}</Text>
      <Text style={[styles.instruction, { color: c.textSecondary }]}>
        {t('mission.typing.instruction')}
      </Text>
      <View style={[styles.targetContainer, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
        <Text style={styles.targetText}>{renderHighlightedTarget()}</Text>
      </View>
      <TextInput
        style={[styles.typingInput, { color: c.text, borderColor: c.border, backgroundColor: c.surfaceElevated }]}
        value={input}
        onChangeText={handleChange}
        placeholder={t('mission.typing.placeholder')}
        placeholderTextColor={c.textSecondary}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        multiline={difficulty === 3}
      />
      <Text style={[styles.progressSmall, { color: c.textSecondary }]}>
        {t('mission.typing.progress', { current: input.length, target: targetText.length })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  instruction: { fontSize: 14, marginBottom: 20 },
  targetContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    marginBottom: 20,
  },
  targetText: { flexDirection: 'row', flexWrap: 'wrap' },
  highlightChar: { fontSize: 20, fontWeight: '500' },
  typingInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    width: '90%',
    marginBottom: 12,
  },
  progressSmall: { fontSize: 14 },
});
