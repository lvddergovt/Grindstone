import type { Equipment, Phase, ProgressState, UserSettings, WorkoutSession, Weekday } from "../types";

const SETTINGS_KEY = "getinshape.settings";
const HISTORY_KEY = "getinshape.history";
const PROGRESS_KEY = "getinshape.progress";

const defaultSettings: UserSettings = {
  name: "",
  workoutDays: [1, 2, 4, 5, 6],
  workoutDurationMinutes: 15,
  equipment: ["bodyweight", "chair", "backpack"],
  phaseByMuscleGroup: {
    armsChest: 1,
    legs: 1,
    abs: 1,
    back: 1
  },
  onboardingCompleted: false
};

const defaultProgress: ProgressState = {
  streakCount: 0,
  totalXp: 0,
  badges: []
};

const validEquipment = new Set<Equipment>(["bodyweight", "chair", "backpack", "kettlebell", "pullupBar"]);
const validWorkoutDays = new Set<Weekday>([0, 1, 2, 3, 4, 5, 6]);

function readJson<T>(key: string): T | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeWorkoutDays(days: unknown): Weekday[] {
  if (!Array.isArray(days)) return defaultSettings.workoutDays;

  const normalized = Array.from(
    new Set(
      days.filter((value): value is Weekday => typeof value === "number" && validWorkoutDays.has(value as Weekday))
    )
  ).sort((left, right) => left - right) as Weekday[];

  return normalized.length > 0 ? normalized : defaultSettings.workoutDays;
}

function normalizeEquipment(equipment: unknown): Equipment[] {
  if (!Array.isArray(equipment)) return defaultSettings.equipment;

  const normalized = Array.from(
    new Set(
      equipment.filter(
        (value): value is Equipment => typeof value === "string" && validEquipment.has(value as Equipment)
      )
    )
  );

  return normalized.length > 0 ? normalized : defaultSettings.equipment;
}

function normalizePhase(value: unknown, fallback: Phase): Phase {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

function normalizeSettings(value: Partial<UserSettings>, hasStoredSettings: boolean): UserSettings {
  return {
    name: typeof value.name === "string" ? value.name : defaultSettings.name,
    workoutDays: normalizeWorkoutDays(value.workoutDays),
    workoutDurationMinutes:
      value.workoutDurationMinutes === 10 || value.workoutDurationMinutes === 15 || value.workoutDurationMinutes === 20
        ? value.workoutDurationMinutes
        : defaultSettings.workoutDurationMinutes,
    equipment: normalizeEquipment(value.equipment),
    phaseByMuscleGroup: {
      armsChest: normalizePhase(value.phaseByMuscleGroup?.armsChest, defaultSettings.phaseByMuscleGroup.armsChest),
      legs: normalizePhase(value.phaseByMuscleGroup?.legs, defaultSettings.phaseByMuscleGroup.legs),
      abs: normalizePhase(value.phaseByMuscleGroup?.abs, defaultSettings.phaseByMuscleGroup.abs),
      back: normalizePhase(value.phaseByMuscleGroup?.back, defaultSettings.phaseByMuscleGroup.back)
    },
    onboardingCompleted:
      typeof value.onboardingCompleted === "boolean" ? value.onboardingCompleted : hasStoredSettings
  };
}

export function loadSettings(): UserSettings {
  const parsed = readJson<Partial<UserSettings>>(SETTINGS_KEY);
  if (!parsed) return defaultSettings;
  return normalizeSettings(parsed, true);
}

export function saveSettings(settings: UserSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): WorkoutSession[] {
  return readJson<WorkoutSession[]>(HISTORY_KEY) ?? [];
}

export function saveHistory(history: WorkoutSession[]): void {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadProgress(): ProgressState {
  return readJson<ProgressState>(PROGRESS_KEY) ?? defaultProgress;
}

export function saveProgress(progress: ProgressState): void {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
