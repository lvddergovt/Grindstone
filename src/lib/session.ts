import type {
  ActiveSession,
  DifficultyFeedback,
  FocusDay,
  Phase,
  WorkoutPlanExercise,
  WorkoutSession
} from "../types";
import {
  adjustTargetFromFeedback,
  buildProgressionNotes,
  calculateStreak,
  calculateXp,
  getLastExerciseRep,
  getTargetType
} from "./workout";

export function createSession(plan: WorkoutPlanExercise[]): ActiveSession {
  const zeroState = Object.fromEntries(plan.map((item) => [item.exercise.id, 0]));
  return {
    plan,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    currentRound: 1,
    totals: { ...zeroState },
    completedRoundsByExercise: { ...zeroState },
    skippedRoundsByExercise: { ...zeroState },
    difficultyByExercise: Object.fromEntries(plan.map((item) => [item.exercise.id, []]))
  };
}

export function nextRepDraft(
  history: WorkoutSession[],
  plan: WorkoutPlanExercise[],
  exerciseIndex: number
): number {
  const exercise = plan[exerciseIndex];
  const previousResult = history[0]?.exerciseResults.find((result) => result.exerciseId === exercise.exercise.id);
  const baseline = getLastExerciseRep(history, exercise.exercise.id) || guessBaselineForPhase(exercise.exercise.phase);
  return adjustTargetFromFeedback(getTargetType(exercise.exercise), baseline, previousResult?.difficulty);
}

export function advanceSession(session: ActiveSession, reps: number, difficulty: DifficultyFeedback) {
  const current = session.plan[session.currentIndex];
  const nextTotals = {
    ...session.totals,
    [current.exercise.id]: (session.totals[current.exercise.id] ?? 0) + Math.max(0, reps)
  };
  const nextCompletedRounds = {
    ...session.completedRoundsByExercise,
    [current.exercise.id]: (session.completedRoundsByExercise[current.exercise.id] ?? 0) + 1
  };
  const nextDifficulty = {
    ...session.difficultyByExercise,
    [current.exercise.id]: [...(session.difficultyByExercise[current.exercise.id] ?? []), difficulty]
  };

  return moveToNextExercise({
    ...session,
    totals: nextTotals,
    completedRoundsByExercise: nextCompletedRounds,
    difficultyByExercise: nextDifficulty
  });
}

export function skipCurrentExercise(session: ActiveSession) {
  const current = session.plan[session.currentIndex];
  const nextSkipped = {
    ...session.skippedRoundsByExercise,
    [current.exercise.id]: (session.skippedRoundsByExercise[current.exercise.id] ?? 0) + 1
  };

  return moveToNextExercise({
    ...session,
    skippedRoundsByExercise: nextSkipped
  });
}

export function swapCurrentExercise(session: ActiveSession, replacement: WorkoutPlanExercise): ActiveSession {
  const currentId = session.plan[session.currentIndex].exercise.id;
  const nextPlan = session.plan.map((item, index) => (index === session.currentIndex ? replacement : item));

  return {
    ...session,
    plan: nextPlan,
    totals: carryNumberState(session.totals, currentId, replacement.exercise.id),
    completedRoundsByExercise: carryNumberState(
      session.completedRoundsByExercise,
      currentId,
      replacement.exercise.id
    ),
    skippedRoundsByExercise: carryNumberState(session.skippedRoundsByExercise, currentId, replacement.exercise.id),
    difficultyByExercise: carryDifficultyState(session.difficultyByExercise, currentId, replacement.exercise.id)
  };
}

export function completeSession(args: {
  session: ActiveSession;
  history: WorkoutSession[];
  focus: FocusDay;
  elapsedSeconds: number;
  fallbackDurationMinutes: number;
  existingBadges: string[];
}) {
  const { session, history, focus, elapsedSeconds, fallbackDurationMinutes, existingBadges } = args;
  const exerciseResults = session.plan.map((item) => ({
    exerciseId: item.exercise.id,
    reps: session.totals[item.exercise.id] ?? 0,
    completedRounds: session.completedRoundsByExercise[item.exercise.id] ?? 0,
    skippedRounds: session.skippedRoundsByExercise[item.exercise.id] ?? 0,
    difficulty: summarizeDifficulty(session.difficultyByExercise[item.exercise.id] ?? []),
    targetType: getTargetType(item.exercise)
  }));
  const totalReps = exerciseResults.reduce((sum, result) => sum + result.reps, 0);
  const roundsCompleted = Math.max(session.currentRound - 1, totalReps > 0 ? 1 : 0);
  const workoutSession: WorkoutSession = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    focus,
    durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60) || fallbackDurationMinutes),
    roundsCompleted,
    totalReps,
    exerciseResults,
    progressionNotes: []
  };
  workoutSession.progressionNotes = buildProgressionNotes(workoutSession, history);

  const nextHistory = [workoutSession, ...history];
  const streakCount = calculateStreak(nextHistory);
  const gainedXp = calculateXp(workoutSession);
  const nextBadges = new Set(existingBadges);

  if (nextHistory.length >= 1) nextBadges.add("First workout");
  if (streakCount >= 3) nextBadges.add("3-day streak");
  if (nextHistory.length >= 5) nextBadges.add("5 workouts");
  if (nextHistory.reduce((sum, entry) => sum + entry.totalReps, 0) >= 100) nextBadges.add("100 reps");
  if (workoutSession.roundsCompleted >= 3) nextBadges.add("3-round finisher");

  return {
    workoutSession,
    nextHistory,
    streakCount,
    gainedXp,
    badges: Array.from(nextBadges)
  };
}

export function guessBaselineForPhase(phase: Phase): number {
  switch (phase) {
    case 1:
      return 10;
    case 2:
      return 8;
    case 3:
      return 6;
    default:
      return 5;
  }
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function moveToNextExercise(session: ActiveSession) {
  const nextIndex = session.currentIndex + 1;
  const wrapped = nextIndex >= session.plan.length;

  return {
    session: {
      ...session,
      currentIndex: wrapped ? 0 : nextIndex,
      currentRound: wrapped ? session.currentRound + 1 : session.currentRound
    },
    upcomingIndex: wrapped ? 0 : nextIndex
  };
}

function summarizeDifficulty(feedback: DifficultyFeedback[]): DifficultyFeedback | undefined {
  if (feedback.length === 0) return undefined;

  const counts = feedback.reduce(
    (totals, value) => {
      totals[value] += 1;
      return totals;
    },
    { tooEasy: 0, goodChallenge: 0, tooHard: 0 }
  );

  if (counts.tooHard >= counts.goodChallenge && counts.tooHard >= counts.tooEasy) return "tooHard";
  if (counts.tooEasy > counts.goodChallenge && counts.tooEasy > counts.tooHard) return "tooEasy";
  return "goodChallenge";
}

function carryNumberState(source: Record<string, number>, fromId: string, toId: string): Record<string, number> {
  const next = { ...source };
  const carried = next[fromId] ?? 0;
  delete next[fromId];
  next[toId] = Math.max(next[toId] ?? 0, carried);
  return next;
}

function carryDifficultyState(
  source: Record<string, DifficultyFeedback[]>,
  fromId: string,
  toId: string
): Record<string, DifficultyFeedback[]> {
  const next = { ...source };
  const carried = next[fromId] ?? [];
  delete next[fromId];
  next[toId] = [...(next[toId] ?? []), ...carried];
  return next;
}
