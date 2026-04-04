import { useEffect, useState } from "react";
import { muscleLabels } from "../constants/labels";
import { formatDuration } from "../lib/session";
import type { ActiveSession, DifficultyFeedback, ExerciseTargetType, WorkoutPlanExercise } from "../types";
import { MiniStat } from "./Surface";

export function WorkoutTab({
  session,
  currentExercise,
  elapsedSeconds,
  durationMinutes,
  lastRepForCurrent,
  currentTargetType,
  repDraft,
  setRepDraft,
  difficultyDraft,
  setDifficultyDraft,
  swapOptions,
  onLogCurrentExercise,
  onSkipCurrentExercise,
  onSwapCurrentExercise,
  onFinishWorkout,
  onSavePartialWorkout,
  onDiscardWorkout,
  isSessionComplete
}: {
  session: ActiveSession;
  currentExercise: ActiveSession["plan"][number];
  elapsedSeconds: number;
  durationMinutes: number;
  lastRepForCurrent: number;
  currentTargetType: ExerciseTargetType;
  repDraft: number;
  setRepDraft: (value: number) => void;
  difficultyDraft: DifficultyFeedback;
  setDifficultyDraft: (value: DifficultyFeedback) => void;
  swapOptions: WorkoutPlanExercise[];
  onLogCurrentExercise: () => void;
  onSkipCurrentExercise: () => void;
  onSwapCurrentExercise: (replacement: WorkoutPlanExercise) => void;
  onFinishWorkout: () => void;
  onSavePartialWorkout: () => void;
  onDiscardWorkout: () => void;
  isSessionComplete: boolean;
}) {
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);
  const metricLabel = currentTargetType === "seconds" ? "seconds" : "reps";
  const nextCue = isSessionComplete
    ? "The timer target is met. Finish this movement cleanly, then wrap up when ready."
    : session.currentIndex === session.plan.length - 1
      ? "Last move of the round. One more log will roll you back to the top."
      : "Log this set, then move straight into the next pattern.";

  useEffect(() => {
    if (restSecondsLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRestSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [restSecondsLeft]);

  useEffect(() => {
    setConfirmEndEarly(false);
  }, [session.currentIndex, session.currentRound, isSessionComplete]);

  function handleFinishPress() {
    if (isSessionComplete) {
      onFinishWorkout();
      return;
    }

    setConfirmEndEarly(true);
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Workout Mode</p>
            <h2 className="mt-2 font-display text-2xl">Round {session.currentRound}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Timer</p>
            <p className="font-display text-3xl">{formatDuration(elapsedSeconds)}</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(100, (elapsedSeconds / (durationMinutes * 60)) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-mist/70">
          Move fast, rest short, and loop the circuit until the timer feels right for the day.
        </p>
        <p className="mt-2 text-sm text-accent">{nextCue}</p>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">
              {currentExercise.role === "focus" ? "Focus move" : muscleLabels[currentExercise.exercise.muscleGroup]}
            </p>
            <h3 className="mt-2 font-display text-3xl">{currentExercise.exercise.name}</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-mist/70">
            {session.currentIndex + 1}/{session.plan.length}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniStat label="Target" value={currentExercise.targetLabel} />
          <MiniStat label="Last time" value={lastRepForCurrent > 0 ? `${lastRepForCurrent} ${metricLabel}` : "No log"} />
        </div>
        {currentExercise.exercise.notes ? <p className="mt-4 text-sm text-mist/70">{currentExercise.exercise.notes}</p> : null}

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/60">How did it feel?</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["tooEasy", "Too easy"],
              ["goodChallenge", "Good"],
              ["tooHard", "Too hard"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`rounded-full px-3 py-3 text-sm font-medium transition ${
                  difficultyDraft === value ? "bg-accent text-slate-950" : "border border-white/10 bg-slate-950/60 text-mist/80"
                }`}
                type="button"
                onClick={() => setDifficultyDraft(value as DifficultyFeedback)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex w-full items-center gap-3">
          <button
            className="h-12 w-12 rounded-full border border-white/10 bg-slate-950/60 text-2xl sm:h-14 sm:w-14"
            type="button"
            onClick={() => setRepDraft(Math.max(0, repDraft - (currentTargetType === "seconds" ? 5 : 1)))}
          >
            -
          </button>
          <input
            className="h-14 min-w-0 flex-1 rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-2 text-center text-2xl outline-none sm:h-16 sm:px-4 sm:text-3xl"
            min={0}
            type="number"
            value={repDraft}
            onChange={(event) => setRepDraft(Math.max(0, Number(event.target.value) || 0))}
          />
          <button
            className="h-12 w-12 rounded-full border border-white/10 bg-slate-950/60 text-2xl sm:h-14 sm:w-14"
            type="button"
            onClick={() => setRepDraft(repDraft + (currentTargetType === "seconds" ? 5 : 1))}
          >
            +
          </button>
        </div>
        <p className="mt-2 text-center text-sm text-mist/60">Log total {metricLabel} for this movement before moving on.</p>

        <button
          className="mt-5 w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
          onClick={onLogCurrentExercise}
          type="button"
        >
          {session.currentIndex === session.plan.length - 1 ? "Finish round" : "Next movement"}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            onClick={onSkipCurrentExercise}
            type="button"
          >
            Skip movement
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            onClick={() => setRestSecondsLeft(30)}
            type="button"
          >
            Quick rest 30s
          </button>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/45 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Rest timer</p>
            <p className="font-display text-2xl">{formatDuration(restSecondsLeft)}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[15, 30, 45].map((seconds) => (
              <button
                key={seconds}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-mist/80 transition hover:bg-white/10"
                type="button"
                onClick={() => setRestSecondsLeft(seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/45 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Swap movement</p>
          <p className="mt-2 text-sm text-mist/70">Swap stays in the same muscle group and phase when possible.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {swapOptions.length > 0 ? (
              swapOptions.map((option) => (
                <button
                  key={option.exercise.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                  type="button"
                  onClick={() => onSwapCurrentExercise(option)}
                >
                  {option.exercise.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-mist/60">No clean swap options available for this setup.</p>
            )}
          </div>
        </div>

        {!confirmEndEarly || isSessionComplete ? (
          <button
            className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
            onClick={handleFinishPress}
            type="button"
          >
            {isSessionComplete ? "Complete workout" : "End workout early"}
          </button>
        ) : (
          <div className="mt-3 rounded-[1.25rem] border border-amber-300/20 bg-amber-300/10 px-4 py-4">
            <p className="text-sm font-medium text-amber-100">End this workout?</p>
            <p className="mt-2 text-sm text-mist/75">Save it as a partial session or discard it and return to the dashboard.</p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                className="w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
                onClick={onSavePartialWorkout}
                type="button"
              >
                Save partial workout
              </button>
              <button
                className="w-full rounded-full border border-rose-300/25 bg-rose-300/10 px-5 py-4 font-medium text-rose-100 transition hover:bg-rose-300/15"
                onClick={onDiscardWorkout}
                type="button"
              >
                Discard workout
              </button>
              <button
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
                onClick={() => setConfirmEndEarly(false)}
                type="button"
              >
                Keep going
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl">Session totals</h3>
        {session.plan.map((item) => (
          <div key={item.exercise.id} className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mist/60">
                {item.role === "focus" ? "Focus" : muscleLabels[item.exercise.muscleGroup]}
              </p>
              <p className="mt-1 font-medium">{item.exercise.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-mist/60">
                {(session.skippedRoundsByExercise[item.exercise.id] ?? 0) > 0
                  ? `Skipped ${session.skippedRoundsByExercise[item.exercise.id]}`
                  : "Logged"}
              </p>
              <p className="font-display text-2xl">{session.totals[item.exercise.id] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
