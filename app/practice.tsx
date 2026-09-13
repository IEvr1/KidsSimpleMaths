import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AnswerInput } from '@/src/components/AnswerInput';
import { CelebrationOverlay } from '@/src/components/CelebrationOverlay';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useApp } from '@/src/context/AppContext';
import { useI18n } from '@/src/i18n/context';
import { generateQuestion } from '@/src/logic/generateQuestion';
import { formatPoints } from '@/src/logic/formatPoints';
import { calculateScore, getPointsPerAnswer } from '@/src/logic/scoring';
import type { Operation, Question } from '@/src/logic/types';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const VALID_OPS: Operation[] = ['add', 'subtract', 'multiply', 'divide'];

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ op?: string }>();
  const { t, tOperation } = useI18n();
  const { points, goal, streak, addPoints, setStreak } = useApp();
  const inputRef = useRef<TextInput>(null);

  const operation = VALID_OPS.includes(params.op as Operation)
    ? (params.op as Operation)
    : 'add';

  const [question, setQuestion] = useState<Question>(() => generateQuestion(operation));
  const [answerInput, setAnswerInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakBonusMsg, setStreakBonusMsg] = useState(false);
  const [emptyHint, setEmptyHint] = useState(false);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(operation));
    setAnswerInput('');
    setSubmitted(false);
    setFeedback(null);
    setStreakBonusMsg(false);
    setEmptyHint(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [operation]);

  useEffect(() => {
    nextQuestion();
  }, [operation, nextQuestion]);

  const handleSubmit = () => {
    if (submitted) return;

    if (!answerInput.trim()) {
      setEmptyHint(true);
      return;
    }

    setSubmitted(true);
    setEmptyHint(false);
    const parsed = parseInt(answerInput, 10);
    const isCorrect = parsed === question.answer;

    if (isCorrect) {
      const result = calculateScore(operation, points, streak, goal, true);
      addPoints(result.pointsEarned);
      setStreak(result.newStreak);
      setFeedback('correct');
      setStreakBonusMsg(result.streakBonus);
      if (result.goalReached) {
        setShowCelebration(true);
      }
      setTimeout(nextQuestion, result.streakBonus ? 1200 : 800);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(nextQuestion, 1800);
    }
  };

  const inputState =
    feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'wrong' : 'default';

  const questionText = `${question.a} ${question.symbol} ${question.b} = ?`;
  const percent = goal > 0 ? Math.min(100, Math.round((points / goal) * 100)) : 0;

  return (
    <ScreenLayout scroll={false} showLangToggle={false} compact keyboardAvoiding>
      <View style={styles.header}>
        <PrimaryButton
          compact
          label={t('back')}
          onPress={() => router.back()}
          variant="secondary"
        />
        <Text style={styles.opLabel}>{tOperation(operation)}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>
          {t('pointsOfGoal', { current: formatPoints(points), goal })}
        </Text>
        <Text style={styles.streakText}>{t('streak', { count: streak })}</Text>
      </View>

      <ProgressBar compact current={points} goal={goal} />
      <Text style={styles.percentInline}>{percent}%</Text>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{questionText}</Text>
      </View>

      {feedback ? (
        <View
          style={[
            styles.feedback,
            feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>
            {feedback === 'correct'
              ? t('correct')
              : t('wrongWithAnswer', { answer: question.answer })}
          </Text>
          {streakBonusMsg ? (
            <Text style={styles.bonusText}>
              {t('streakBonus', { bonus: formatPoints(getPointsPerAnswer(operation)) })}
            </Text>
          ) : null}
        </View>
      ) : emptyHint ? (
        <View style={styles.feedback}>
          <Text style={styles.emptyHint}>{t('emptyAnswer')}</Text>
        </View>
      ) : null}

      <AnswerInput
        compact
        value={answerInput}
        onChangeText={setAnswerInput}
        onSubmit={handleSubmit}
        placeholder={t('enterAnswer')}
        submitLabel={t('checkAnswer')}
        enterHint={t('enterHint')}
        disabled={submitted}
        inputRef={inputRef}
        state={inputState}
      />

      <CelebrationOverlay
        visible={showCelebration}
        message={t('goalReached')}
        buttonLabel={t('keepPlaying')}
        onDismiss={() => setShowCelebration(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  opLabel: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    ...typography.label,
    fontSize: 15,
    color: colors.ink,
  },
  streakText: {
    ...typography.label,
    fontSize: 15,
    color: colors.sunDark,
  },
  percentInline: {
    ...typography.label,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'right',
    marginTop: -4,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: spacing.xs,
  },
  question: {
    ...typography.question,
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
  },
  feedback: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#E8F9EB',
  },
  feedbackWrong: {
    backgroundColor: colors.coralLight,
  },
  feedbackText: {
    ...typography.label,
    color: colors.ink,
    textAlign: 'center',
  },
  bonusText: {
    ...typography.label,
    fontSize: 14,
    color: colors.sunDark,
    marginTop: 2,
  },
  emptyHint: {
    ...typography.label,
    fontSize: 14,
    color: colors.coral,
    textAlign: 'center',
  },
});
