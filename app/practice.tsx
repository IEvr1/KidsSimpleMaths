import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AnswerInput } from '@/src/components/AnswerInput';
import { CelebrationOverlay } from '@/src/components/CelebrationOverlay';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useApp } from '@/src/context/AppContext';
import { useI18n } from '@/src/i18n/context';
import { useDifficulty } from '@/src/hooks/useDifficulty';
import { generateQuestion } from '@/src/logic/generateQuestion';
import { formatPoints } from '@/src/logic/formatPoints';
import { goHome } from '@/src/navigation/goHome';
import { calculateScore } from '@/src/logic/scoring';
import type { Operation, Question } from '@/src/logic/types';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const VALID_OPS: Operation[] = ['add', 'subtract', 'multiply', 'divide'];

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ op?: string }>();
  const { t, tOperation } = useI18n();
  const {
    points,
    goal,
    streak,
    addSubMax,
    multiplyTables,
    divideDivisors,
    addPoints,
    setStreak,
  } = useApp();
  const inputRef = useRef<TextInput>(null);

  const operation = VALID_OPS.includes(params.op as Operation)
    ? (params.op as Operation)
    : 'add';

  const limits = { addSubMax, multiplyTables, divideDivisors };
  const { profile, recordResult, loaded } = useDifficulty(
    operation,
    addSubMax,
    multiplyTables,
    divideDivisors,
  );

  const makeQuestion = useCallback(
    () => generateQuestion(operation, limits, profile),
    [operation, addSubMax, multiplyTables, divideDivisors, profile],
  );

  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion(operation, limits),
  );
  const [answerInput, setAnswerInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [emptyHint, setEmptyHint] = useState(false);

  const resetForQuestion = useCallback(
    (q: Question) => {
      setQuestion(q);
      setAnswerInput('');
      setSubmitted(false);
      setFeedback(null);
      setEmptyHint(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    resetForQuestion(makeQuestion());
  }, [makeQuestion, resetForQuestion]);

  useEffect(() => {
    if (!loaded) return;
    resetForQuestion(generateQuestion(operation, limits, profile));
  }, [operation, loaded]);

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

    recordResult(question, isCorrect);

    if (isCorrect) {
      const result = calculateScore(operation, points, streak, goal, true);
      addPoints(result.pointsEarned);
      setStreak(result.newStreak);
      setFeedback('correct');
      if (result.goalReached) {
        setShowCelebration(true);
        return;
      }
      setTimeout(nextQuestion, 800);
    } else {
      setStreak(0);
      setFeedback('wrong');
    }
  };

  const inputState =
    feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'wrong' : 'default';

  const questionText = `${question.a} ${question.symbol} ${question.b} = ?`;

  return (
    <ScreenLayout scroll={false} showLangToggle={false} compact keyboardAvoiding>
      <View style={styles.header}>
        <PrimaryButton
          compact
          label={t('back')}
          onPress={() => goHome(router)}
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
        </View>
      ) : emptyHint ? (
        <View style={styles.feedback}>
          <Text style={styles.emptyHint}>{t('emptyAnswer')}</Text>
        </View>
      ) : null}

      {feedback === 'wrong' ? (
        <PrimaryButton label={t('nextQuestion')} onPress={nextQuestion} />
      ) : (
        <AnswerInput
          compact
          value={answerInput}
          onChangeText={setAnswerInput}
          onSubmit={handleSubmit}
          placeholder={t('enterAnswer')}
          submitLabel={t('checkAnswer')}
          disabled={submitted}
          inputRef={inputRef}
          state={inputState}
        />
      )}

      <CelebrationOverlay
        visible={showCelebration}
        message={t('goalReached')}
        subtitle={t('goalReachedSubtitle')}
        buttonLabel={t('keepPlaying')}
        onDismiss={() => {
          setShowCelebration(false);
          nextQuestion();
        }}
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
  emptyHint: {
    ...typography.label,
    fontSize: 14,
    color: colors.coral,
    textAlign: 'center',
  },
});
