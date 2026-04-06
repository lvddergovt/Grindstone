import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { ProgressTab } from "./components/ProgressTab";
import { SettingsTab } from "./components/SettingsTab";
import { SetupTab } from "./components/SetupTab";
import { BottomNav } from "./components/Surface";
import { TodayTab } from "./components/TodayTab";
import { TrophiesTab } from "./components/TrophiesTab";
import { WorkoutTab } from "./components/WorkoutTab";
import { WorkoutSummary } from "./components/WorkoutSummary";
import {
  advanceSession,
  completeSession,
  createSession,
  nextRepDraft,
  skipCurrentExercise,
  swapCurrentExercise
} from "./lib/session";
import { loadHistory, loadProgress, loadSettings, saveHistory, saveProgress, saveSettings } from "./lib/storage";
import { buildWorkout, getLastExerciseRep, getSwapOptions, getTargetType, getTodayFocus, levelFromXp } from "./lib/workout";
import type {
  ActiveSession,
  AppTab,
  Equipment,
  Phase,
  ProgressState,
  UserSettings,
  Weekday,
  WorkoutCompletionStatus,
  WorkoutPlanExercise,
  WorkoutSession,
  WorkoutSummaryData
} from "./types";

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [history, setHistory] = useState<WorkoutSession[]>(() => loadHistory());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [tab, setTab] = useState<AppTab>("today");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [latestSummary, setLatestSummary] = useState<WorkoutSummaryData | null>(null);
  const [repDraft, setRepDraft] = useState(8);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const todayFocus = getTodayFocus(settings);
  const displayName = settings.name.trim() || "Athlete";

  const todaysWorkout = useMemo(() => buildWorkout(settings, todayFocus), [settings, todayFocus]);
  const completedToday = useMemo(() => {
    const now = new Date();
    const todayKey = localDateKey(now);
    return history.some((session) => session.completionStatus === "completed" && localDateKey(new Date(session.date)) === todayKey);
  }, [history]);
  const completedThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return history.filter((session) => new Date(session.date) >= weekAgo).length;
  }, [history]);
  const totalRepsAllTime = history.reduce((sum, session) => sum + session.totalReps, 0);
  const level = levelFromXp(progress.totalXp);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const started = new Date(activeSession.startedAt).getTime();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    if (latestSummary && !activeSession) {
      setTab("summary");
    }
  }, [latestSummary, activeSession]);

  const currentExercise = activeSession ? activeSession.plan[activeSession.currentIndex] : null;
  const lastRepForCurrent = currentExercise ? getLastExerciseRep(history, currentExercise.exercise.id) : 0;
  const currentTargetType = currentExercise ? getTargetType(currentExercise.exercise) : "reps";
  const swapOptions = useMemo(
    () => (activeSession && currentExercise ? getSwapOptions(currentExercise, settings, activeSession.plan) : []),
    [activeSession, currentExercise, settings]
  );
  const isSessionComplete = elapsedSeconds >= settings.workoutDurationMinutes * 60;

  function startWorkout() {
    const session = createSession(todaysWorkout);
    setActiveSession(session);
    setRepDraft(nextRepDraft(history, session.plan, 0));
    setTab("workout");
  }

  function logCurrentExercise() {
    if (!activeSession) return;

    const { session, upcomingIndex } = advanceSession(activeSession, repDraft);
    setActiveSession(session);
    setRepDraft(nextRepDraft(history, session.plan, upcomingIndex));
  }

  function handleSkipCurrentExercise() {
    if (!activeSession) return;

    const { session, upcomingIndex } = skipCurrentExercise(activeSession);
    setActiveSession(session);
    setRepDraft(nextRepDraft(history, session.plan, upcomingIndex));
  }

  function handleSwapCurrentExercise(replacement: WorkoutPlanExercise) {
    if (!activeSession) return;

    const session = swapCurrentExercise(activeSession, replacement);
    setActiveSession(session);
    setRepDraft(nextRepDraft(history, session.plan, session.currentIndex));
  }

  function finishWorkout(completionStatus: WorkoutCompletionStatus = "completed", userNote = "") {
    if (!activeSession) return;

    const previousSession = history[0];
    const result = completeSession({
      session: activeSession,
      history,
      focus: todayFocus,
      completionStatus,
      elapsedSeconds,
      fallbackDurationMinutes: settings.workoutDurationMinutes,
      existingBadges: progress.badges,
      userNote
    });
    const unlockedBadges = result.badges.filter((badge) => !progress.badges.includes(badge));
    const totalXp = progress.totalXp + result.gainedXp;
    const level = levelFromXp(totalXp);
    const xpIntoLevel = totalXp % 250;
    const xpToNextLevel = 250 - xpIntoLevel || 250;

    setHistory(result.nextHistory);
    setProgress({
      streakCount: result.streakCount,
      totalXp,
      badges: result.badges
    });
    setLatestSummary({
      session: result.workoutSession,
      durationSeconds: elapsedSeconds,
      gainedXp: result.gainedXp,
      totalXp,
      level,
      xpToNextLevel,
      totalWorkouts: result.nextHistory.length,
      previousStreakCount: progress.streakCount,
      streakCount: result.streakCount,
      unlockedBadges,
      previousSession
    });
    setActiveSession(null);
    setRepDraft(8);
    setTab("summary");
  }

  function discardWorkout() {
    setActiveSession(null);
    setLatestSummary(null);
    setElapsedSeconds(0);
    setRepDraft(8);
    setTab("today");
  }

  function savePartialWorkout(note: string) {
    finishWorkout("partial", note);
  }

  function updatePhase(group: keyof UserSettings["phaseByMuscleGroup"], value: number) {
    setSettings({
      ...settings,
      phaseByMuscleGroup: {
        ...settings.phaseByMuscleGroup,
        [group]: value as Phase
      }
    });
  }

  function toggleEquipment(equipment: Equipment) {
    setSettings((current) => ({
      ...current,
      equipment: current.equipment.includes(equipment)
        ? current.equipment.length === 1
          ? current.equipment
          : current.equipment.filter((item) => item !== equipment)
        : [...current.equipment, equipment]
    }));
  }

  function toggleWorkoutDay(day: Weekday) {
    setSettings((current) => ({
      ...current,
      workoutDays: current.workoutDays.includes(day)
        ? current.workoutDays.length === 1
          ? current.workoutDays
          : current.workoutDays.filter((item) => item !== day)
        : [...current.workoutDays, day].sort((left, right) => left - right) as Weekday[]
    }));
  }

  function completeOnboarding() {
    setSettings((current) => ({ ...current, onboardingCompleted: true }));
    setTab("today");
  }

  function importBackup(data: { settings: UserSettings; history: WorkoutSession[]; progress: ProgressState }) {
    setActiveSession(null);
    setLatestSummary(null);
    setSettings(data.settings);
    setHistory(data.history);
    setProgress(data.progress);
    setTab("settings");
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className={`mx-auto flex min-h-screen max-w-md flex-col px-5 pt-6 ${settings.onboardingCompleted ? "pb-28" : "pb-8"}`}>
        {settings.onboardingCompleted ? <AppHeader name={displayName} level={level} /> : null}

        <main className={`flex-1 ${settings.onboardingCompleted ? "pt-6" : ""}`}>
          {!settings.onboardingCompleted ? (
            <OnboardingFlow
              settings={settings}
              onNameChange={(name) => setSettings({ ...settings, name })}
              onDurationChange={(workoutDurationMinutes) => setSettings({ ...settings, workoutDurationMinutes })}
              onEquipmentToggle={toggleEquipment}
              onWorkoutDayToggle={toggleWorkoutDay}
              onPhaseChange={updatePhase}
              onComplete={completeOnboarding}
              onSkip={completeOnboarding}
            />
          ) : (
            <>
              {tab === "today" && (
                <TodayTab
                  focus={todayFocus}
                  durationMinutes={settings.workoutDurationMinutes}
                  streakCount={progress.streakCount}
                  workoutPlan={todaysWorkout}
                  completedToday={completedToday}
                  completedThisWeek={completedThisWeek}
                  onStartWorkout={startWorkout}
                />
              )}

              {tab === "workout" && activeSession && currentExercise && (
                <WorkoutTab
                  session={activeSession}
                  currentExercise={currentExercise}
                  history={history}
                  elapsedSeconds={elapsedSeconds}
                  durationMinutes={settings.workoutDurationMinutes}
                  lastRepForCurrent={lastRepForCurrent}
                  currentTargetType={currentTargetType}
                  repDraft={repDraft}
                  setRepDraft={setRepDraft}
                  swapOptions={swapOptions}
                  onLogCurrentExercise={logCurrentExercise}
                  onSkipCurrentExercise={handleSkipCurrentExercise}
                  onSwapCurrentExercise={handleSwapCurrentExercise}
                  onFinishWorkout={(note) => finishWorkout("completed", note)}
                  onSavePartialWorkout={savePartialWorkout}
                  onDiscardWorkout={discardWorkout}
                  isSessionComplete={isSessionComplete}
                />
              )}

              {tab === "progress" && (
                <ProgressTab progress={progress} history={history} totalRepsAllTime={totalRepsAllTime} />
              )}

              {tab === "trophies" && <TrophiesTab progress={progress} />}

              {tab === "summary" && latestSummary && (
                <WorkoutSummary
                  summary={latestSummary}
                  onContinue={() => setTab("today")}
                  onOpenProgress={() => setTab("progress")}
                />
              )}

              {tab === "settings" && (
                <SettingsTab
                  settings={settings}
                  history={history}
                  progress={progress}
                  onOpenSetup={() => setTab("setup")}
                  onImport={importBackup}
                />
              )}

              {tab === "setup" && (
                <SetupTab
                  settings={settings}
                  onNameChange={(name) => setSettings({ ...settings, name })}
                  onDurationChange={(workoutDurationMinutes) => setSettings({ ...settings, workoutDurationMinutes })}
                  onEquipmentToggle={toggleEquipment}
                  onWorkoutDayToggle={toggleWorkoutDay}
                  onPhaseChange={updatePhase}
                  onBack={() => setTab("settings")}
                />
              )}
            </>
          )}
        </main>

        {settings.onboardingCompleted && tab !== "summary" && !activeSession ? (
          <BottomNav current={tab} onClick={setTab} workoutEnabled={Boolean(activeSession)} />
        ) : null}
      </div>
    </div>
  );
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
