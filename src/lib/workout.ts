import { exercises } from "../data/exercises";
import type {
  DifficultyFeedback,
  Exercise,
  ExerciseTargetType,
  FocusDay,
  MuscleGroup,
  UserSettings,
  Weekday,
  WorkoutPlanExercise,
  WorkoutSession
} from "../types";

const muscleGroups: MuscleGroup[] = ["armsChest", "legs", "abs", "back"];
const focusRotation: MuscleGroup[] = ["armsChest", "legs", "abs", "back", "armsChest", "legs", "abs"];

export function getTodayFocus(settings?: Pick<UserSettings, "workoutDays">, date = new Date()): FocusDay {
  if (!settings) {
    return getLegacyFocus(date.getDay() as Weekday);
  }

  const sortedWorkoutDays = Array.from(new Set(settings.workoutDays)).sort((left, right) => left - right);
  const today = date.getDay() as Weekday;
  const slot = sortedWorkoutDays.indexOf(today);

  if (slot === -1) {
    return "recovery";
  }

  return focusRotation[slot % focusRotation.length];
}

function getLegacyFocus(day: Weekday): FocusDay {
  switch (day) {
    case 1:
      return "armsChest";
    case 2:
      return "legs";
    case 4:
      return "abs";
    case 5:
      return "back";
    case 6:
      return "armsChest";
    default:
      return "recovery";
  }
}

export function buildWorkout(settings: UserSettings, focus: FocusDay, date = new Date()): WorkoutPlanExercise[] {
  const equipment = new Set(settings.equipment);
  const seed = date.toISOString().slice(0, 10);
  const baseMovements = muscleGroups.map((group) => {
    const choice = chooseExercise(group, settings.phaseByMuscleGroup[group], equipment, seed, "base");
    return {
      exercise: choice,
      role: "base" as const,
      targetLabel: targetLabelForExercise(choice)
    };
  });

  if (focus === "recovery") {
    return baseMovements;
  }

  const focusCount = settings.workoutDurationMinutes >= 20 ? 2 : 1;
  const focusExtras: WorkoutPlanExercise[] = [];
  const usedIds = new Set(baseMovements.map((entry) => entry.exercise.id));

  for (let index = 0; index < focusCount; index += 1) {
    const focusExercise = chooseExercise(
      focus,
      settings.phaseByMuscleGroup[focus],
      equipment,
      `${seed}:${index}`,
      "focus",
      usedIds
    );
    usedIds.add(focusExercise.id);
    focusExtras.push({
      exercise: focusExercise,
      role: "focus",
      targetLabel: targetLabelForExercise(focusExercise)
    });
  }

  return [...baseMovements, ...focusExtras];
}

export function getSwapOptions(
  current: WorkoutPlanExercise,
  settings: UserSettings,
  plan: WorkoutPlanExercise[]
): WorkoutPlanExercise[] {
  const excludedIds = new Set(plan.map((item) => item.exercise.id).filter((id) => id !== current.exercise.id));
  const options = exercises.filter(
    (exercise) =>
      exercise.id !== current.exercise.id &&
      exercise.muscleGroup === current.exercise.muscleGroup &&
      exercise.phase === current.exercise.phase &&
      exercise.equipmentNeeded.every((item) => settings.equipment.includes(item)) &&
      !excludedIds.has(exercise.id)
  );

  const fallbackOptions = exercises.filter(
    (exercise) =>
      exercise.id !== current.exercise.id &&
      exercise.muscleGroup === current.exercise.muscleGroup &&
      exercise.phase <= current.exercise.phase &&
      exercise.equipmentNeeded.every((item) => settings.equipment.includes(item)) &&
      !excludedIds.has(exercise.id)
  );

  return (options.length > 0 ? options : fallbackOptions).slice(0, 4).map((exercise) => ({
    exercise,
    role: current.role,
    targetLabel: targetLabelForExercise(exercise)
  }));
}

function chooseExercise(
  group: MuscleGroup,
  phase: number,
  equipment: Set<string>,
  seed: string,
  role: "base" | "focus",
  excludedIds = new Set<string>()
): Exercise {
  const exactMatches = exercises.filter((exercise) => exercise.muscleGroup === group && exercise.phase === phase);
  const availableExact = exactMatches.filter(
    (exercise) => exercise.equipmentNeeded.every((item) => equipment.has(item)) && !excludedIds.has(exercise.id)
  );
  const fallbackExact = exactMatches.filter((exercise) => !excludedIds.has(exercise.id));
  const exactPool = availableExact.length > 0 ? availableExact : fallbackExact;

  if (exactPool.length > 0) {
    return pickSeeded(exactPool, `${seed}:${group}:${phase}:${role}`);
  }

  const fallback = exercises.filter(
    (exercise) =>
      exercise.muscleGroup === group &&
      exercise.phase <= phase &&
      exercise.equipmentNeeded.every((item) => equipment.has(item)) &&
      !excludedIds.has(exercise.id)
  );

  if (fallback.length > 0) {
    return pickSeeded(fallback, `${seed}:${group}:fallback:${role}`);
  }

  return exercises.find((exercise) => exercise.muscleGroup === group)!;
}

function pickSeeded<T>(items: T[], seed: string): T {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return items[hash % items.length];
}

export function targetLabelForExercise(exercise: Exercise): string {
  const lower = exercise.name.toLowerCase();
  if (lower.includes("plank")) return exercise.phase === 1 ? "20-30 sec" : "30-60 sec";
  if (lower.includes("march")) return "30-45 sec";
  if (lower.includes("swing")) return "12-20 reps";
  if (exercise.phase === 1) return "8-12 reps";
  if (exercise.phase === 2) return "8-15 reps";
  if (exercise.phase === 3) return "6-12 reps";
  return "6-10 weighted reps";
}

export function calculateStreak(history: WorkoutSession[]): number {
  if (history.length === 0) return 0;

  const uniqueDays = Array.from(new Set(history.map((session) => session.date.slice(0, 10)))).sort().reverse();
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const iso = cursor.toISOString().slice(0, 10);
    if (day === iso) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    const previous = new Date(cursor);
    previous.setDate(previous.getDate() - 1);
    const previousIso = previous.toISOString().slice(0, 10);
    if (day === previousIso && streak === 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 2);
      continue;
    }

    break;
  }

  return streak;
}

export function calculateXp(session: WorkoutSession): number {
  return 50 + session.totalReps + session.roundsCompleted * 12;
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function getLastExerciseRep(history: WorkoutSession[], exerciseId: string): number {
  for (const session of history) {
    const found = session.exerciseResults.find((result) => result.exerciseId === exerciseId);
    if (found) return found.reps;
  }
  return 0;
}

export function getTargetType(exercise: Exercise): ExerciseTargetType {
  const lower = exercise.name.toLowerCase();
  if (lower.includes("plank") || lower.includes("march")) return "seconds";
  return "reps";
}

export function adjustTargetFromFeedback(
  targetType: ExerciseTargetType,
  baseline: number,
  difficulty?: DifficultyFeedback
): number {
  const step = targetType === "seconds" ? 5 : 2;

  if (difficulty === "tooEasy") {
    return baseline + step;
  }

  if (difficulty === "tooHard") {
    return Math.max(targetType === "seconds" ? 15 : 1, baseline - step);
  }

  return baseline;
}

export function buildProgressionNotes(session: WorkoutSession, history: WorkoutSession[]): string[] {
  const notes: string[] = [];
  const previousResults = history[0]?.exerciseResults ?? [];

  for (const result of session.exerciseResults) {
    const previous = previousResults.find((entry) => entry.exerciseId === result.exerciseId);
    const delta = result.reps - (previous?.reps ?? 0);
    const movementName = exercises.find((exercise) => exercise.id === result.exerciseId)?.name ?? "This movement";
    const metric = result.targetType === "seconds" ? "seconds" : "reps";

    if ((result.skippedRounds ?? 0) > 0) {
      notes.push(`${movementName} was skipped at least once. Keep the phase and swap earlier if the setup does not feel right.`);
      continue;
    }

    if (result.difficulty === "tooHard") {
      notes.push(`${movementName} pushed the edge today. Keep that variation, tighten form, and aim for smoother ${metric} next time.`);
      continue;
    }

    if (result.difficulty === "tooEasy" && (result.completedRounds ?? 0) >= 2) {
      const threshold = result.targetType === "seconds" ? 10 : 3;
      if (delta >= threshold || !previous) {
        notes.push(`${movementName} looked ready for a bump. That muscle group is close to a level-up.`);
        continue;
      }
    }

    if (previous && delta >= (result.targetType === "seconds" ? 5 : 2)) {
      notes.push(`${movementName} improved by ${delta} ${metric}. Keep matching that standard.`);
    }
  }

  if (notes.length === 0) {
    notes.push("Keep stacking clean work. When a movement feels smooth for two sessions in a row, move it up a notch.");
  }

  return Array.from(new Set(notes)).slice(0, 4);
}
