import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  difficulty: number;
  onComplete: () => void;
}

export default function MathMission({ difficulty, onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '*'];
    const max = difficulty === 1 ? 20 : difficulty === 2 ? 50 : 100;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const op = ops[Math.floor(Math.random() * (difficulty === 1 ? 2 : 3))];
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      default: result = a + b;
    }
    return { display: `${a} ${op} ${b} = ?`, answer: result };
  }, [difficulty]);

  const [problem, setProblem] = useState(generateProblem);
  const [solved, setSolved] = useState(0);
  const target = difficulty;

  const handleSubmit = () => {
    if (parseInt(answer, 10) === problem.answer) {
      const next = solved + 1;
      setSolved(next);
      if (next >= target) {
        onComplete();
      } else {
        setFeedback(t('mission.math.correct'));
        setProblem(generateProblem());
        setAnswer('');
      }
    } else {
      setFeedback(t('mission.math.wrong'));
      Vibration.vibrate(200);
    }
  };

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.math.title')}</Text>
      <Text style={[styles.problemText, { color: c.text }]}>{problem.display}</Text>
      <Text style={[styles.progressSmall, { color: c.textSecondary }]}>{solved}/{target}</Text>
      <TextInput
        style={[styles.mathInput, { color: c.text, borderColor: c.border }]}
        keyboardType="number-pad"
        value={answer}
        onChangeText={setAnswer}
        placeholder={t('mission.math.placeholder')}
        placeholderTextColor={c.textSecondary}
        autoFocus
      />
      {feedback !== '' && <Text style={[styles.feedback, { color: c.accent }]}>{feedback}</Text>}
      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: c.primary }]} onPress={handleSubmit}>
        <Text style={styles.submitText}>{t('mission.math.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  problemText: { fontSize: 36, fontWeight: '300', marginBottom: 10 },
  progressSmall: { fontSize: 14, marginBottom: 20 },
  mathInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 24, width: '80%', textAlign: 'center', marginBottom: 12 },
  feedback: { fontSize: 16, marginBottom: 12 },
  submitBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
