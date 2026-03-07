import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  difficulty: number;
  onComplete: () => void;
}

const EMOJIS = ['🌟', '⚡', '🔥', '💧', '🌊', '🎵', '🎸', '🎨', '🌈', '🍎'];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryMission({ difficulty, onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;

  const pairs = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10;
  const cols = difficulty === 1 ? 4 : 4;

  const cards = useMemo(() => {
    const selected = EMOJIS.slice(0, pairs);
    const deck = [...selected, ...selected];
    return shuffleArray(deck);
  }, [pairs]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleFlip = useCallback(
    (index: number) => {
      if (locked) return;
      if (flipped.includes(index) || matched.includes(index)) return;

      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1);
        setLocked(true);

        const [first, second] = newFlipped;
        if (cards[first] === cards[second]) {
          const newMatched = [...matched, first, second];
          setMatched(newMatched);
          setFlipped([]);
          setLocked(false);

          if (newMatched.length === cards.length) {
            onComplete();
          }
        } else {
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
          }, 800);
        }
      }
    },
    [flipped, matched, locked, cards, onComplete],
  );

  const isFlipped = (index: number) => flipped.includes(index) || matched.includes(index);

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.memory.title')}</Text>
      <Text style={[styles.progressSmall, { color: c.textSecondary }]}>
        {t('mission.memory.moves', { count: moves })}
      </Text>
      <Text style={[styles.progressSmall, { color: c.textSecondary }]}>
        {t('mission.memory.pairs', { current: matched.length / 2, total: pairs })}
      </Text>
      <View style={styles.grid}>
        {cards.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: matched.includes(index)
                  ? c.success
                  : isFlipped(index)
                    ? c.surfaceElevated
                    : c.primary,
                borderColor: c.border,
                width: `${Math.floor(90 / cols)}%`,
              },
            ]}
            onPress={() => handleFlip(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardEmoji}>{isFlipped(index) ? emoji : '?'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  progressSmall: { fontSize: 14, marginBottom: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  card: {
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 28 },
});
