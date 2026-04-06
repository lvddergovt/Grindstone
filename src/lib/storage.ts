import type {
  Equipment,
  FocusDay,
  Phase,
  ProgressState,
  UserSettings,
  WorkoutCompletionStatus,
  WorkoutSession,
  Weekday
} from "../types";

const SETTINGS_KEY = "grindstone.settings";
const HISTORY_KEY = "grindstone.history";
const PROGRESS_KEY = "grindstone.progress";
const LEGACY_SETTINGS_KEY = "getinshape.settings";
const LEGACY_HISTORY_KEY = "getinshape.history";
const LEGACY_PROGRESS_KEY = "getinshape.progress";

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
const validFocusDays = new Set<FocusDay>(["armsChest", "legs", "abs", "back", "recovery"]);
const validCompletionStatuses = new Set<WorkoutCompletionStatus>(["completed", "partial"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readJson<T>(key: string, legacyKey?: string): T | null {
  const raw = window.localStorage.getItem(key) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
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
    onboardingCompleted: typeof value.onboardingCompleted === "boolean" ? value.onboardingCompleted : hasStoredSettings
  };
}

function normalizeHistory(parsed: unknown): WorkoutSession[] {
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((value): value is Record<string, unknown> => isRecord(value))
    .map((session, index) => {
      const completionStatus =
        typeof session.completionStatus === "string" &&
        validCompletionStatuses.has(session.completionStatus as WorkoutCompletionStatus)
          ? (session.completionStatus as WorkoutCompletionStatus)
          : "completed";
      const focus =
        typeof session.focus === "string" && validFocusDays.has(session.focus as FocusDay)
          ? (session.focus as FocusDay)
          : "recovery";
      const date = typeof session.date === "string" ? session.date : new Date().toISOString();
      const id = typeof session.id === "string" ? session.id : `${date}-${index}`;

      return {
        id,
        date,
        focus,
        completionStatus,
        durationMinutes: typeof session.durationMinutes === "number" ? session.durationMinutes : 0,
        roundsCompleted: typeof session.roundsCompleted === "number" ? session.roundsCompleted : 0,
        totalReps: typeof session.totalReps === "number" ? session.totalReps : 0,
        exerciseResults: Array.isArray(session.exerciseResults) ? (session.exerciseResults as WorkoutSession["exerciseResults"]) : [],
        progressionNotes: Array.isArray(session.progressionNotes)
          ? session.progressionNotes.filter((value): value is string => typeof value === "string")
          : undefined
      };
    });
}

function normalizeProgress(value: unknown): ProgressState {
  if (!isRecord(value)) return defaultProgress;

  const totalXp = typeof value.totalXp === "number" ? value.totalXp : defaultProgress.totalXp;
  const streakCount = typeof value.streakCount === "number" ? value.streakCount : defaultProgress.streakCount;
  const badges = Array.isArray(value.badges) ? value.badges.filter((item): item is string => typeof item === "string") : [];

  return { totalXp, streakCount, badges };
}

export function loadSettings(): UserSettings {
  const parsed = readJson<Partial<UserSettings>>(SETTINGS_KEY, LEGACY_SETTINGS_KEY);
  if (!parsed) return defaultSettings;
  return normalizeSettings(parsed, true);
}

export function saveSettings(settings: UserSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): WorkoutSession[] {
  const parsed = readJson<unknown>(HISTORY_KEY, LEGACY_HISTORY_KEY);
  return normalizeHistory(parsed);
}

export function saveHistory(history: WorkoutSession[]): void {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadProgress(): ProgressState {
  const parsed = readJson<unknown>(PROGRESS_KEY, LEGACY_PROGRESS_KEY);
  return normalizeProgress(parsed);
}

export function saveProgress(progress: ProgressState): void {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export type BackupPayloadV1 = {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  history: WorkoutSession[];
  progress: ProgressState;
};

export function createBackupPayload(settings: UserSettings, history: WorkoutSession[], progress: ProgressState): BackupPayloadV1 {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    history,
    progress
  };
}

export function parseBackupPayload(value: unknown): { settings: UserSettings; history: WorkoutSession[]; progress: ProgressState } | null {
  if (!isRecord(value)) return null;
  if (value.version !== 1) return null;
  if (!isRecord(value.settings)) return null;

  const settings = normalizeSettings(value.settings as Partial<UserSettings>, true);
  const history = normalizeHistory(value.history);
  const progress = normalizeProgress(value.progress);

  return { settings, history, progress };
}
