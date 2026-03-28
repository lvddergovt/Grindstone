export type MuscleGroup = "armsChest" | "legs" | "abs" | "back";
export type Phase = 1 | 2 | 3 | 4;
export type FocusDay = "armsChest" | "legs" | "abs" | "back" | "recovery";
export type Equipment = "bodyweight" | "chair" | "backpack" | "kettlebell" | "pullupBar";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AppTab = "today" | "workout" | "progress" | "settings" | "summary";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  phase: Phase;
  equipmentNeeded: Equipment[];
  notes?: string;
}

export interface WorkoutPlanExercise {
  exercise: Exercise;
  role: "base" | "focus";
  targetLabel: string;
}

export type DifficultyFeedback = "tooEasy" | "goodChallenge" | "tooHard";
export type ExerciseTargetType = "reps" | "seconds";
export type WorkoutCompletionStatus = "completed" | "partial";

export interface UserSettings {
  name: string;
  workoutDays: Weekday[];
  workoutDurationMinutes: number;
  equipment: Equipment[];
  phaseByMuscleGroup: Record<MuscleGroup, Phase>;
  onboardingCompleted: boolean;
}

export interface WorkoutExerciseResult {
  exerciseId: string;
  reps: number;
  completedRounds?: number;
  skippedRounds?: number;
  difficulty?: DifficultyFeedback;
  targetType?: ExerciseTargetType;
}

export interface WorkoutSession {
  id: string;
  date: string;
  focus: FocusDay;
  completionStatus: WorkoutCompletionStatus;
  durationMinutes: number;
  roundsCompleted: number;
  totalReps: number;
  exerciseResults: WorkoutExerciseResult[];
  progressionNotes?: string[];
}

export interface ProgressState {
  streakCount: number;
  totalXp: number;
  badges: string[];
}

export interface WorkoutSummaryData {
  session: WorkoutSession;
  durationSeconds: number;
  gainedXp: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  totalWorkouts: number;
  previousStreakCount: number;
  streakCount: number;
  unlockedBadges: string[];
  previousSession?: WorkoutSession;
}

export interface ActiveSession {
  plan: WorkoutPlanExercise[];
  startedAt: string;
  currentIndex: number;
  currentRound: number;
  totals: Record<string, number>;
  completedRoundsByExercise: Record<string, number>;
  skippedRoundsByExercise: Record<string, number>;
  difficultyByExercise: Record<string, DifficultyFeedback[]>;
}
