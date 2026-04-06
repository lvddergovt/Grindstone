import { useEffect, useState } from "react";
import { muscleLabels } from "../constants/labels";
import { formatDuration } from "../lib/session";
import type { ActiveSession, ExerciseTargetType, WorkoutPlanExercise, WorkoutSession } from "../types";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function LineChart({
  values,
  height = 140,
  className
}: {
  values: number[];
  height?: number;
  className?: string;
}) {
  const width = 360;
  const paddingX = 12;
  const paddingY = 16;

  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values.map((value, index) => {
    const x = paddingX + (index / Math.max(1, values.length - 1)) * (width - paddingX * 2);
    const t = (value - min) / range;
    const y = paddingY + (1 - t) * (height - paddingY * 2);
    return { x, y };
  });

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const area = `${line} L${(width - paddingX).toFixed(2)} ${(height - paddingY).toFixed(2)} L${paddingX} ${(height - paddingY).toFixed(2)} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      aria-hidden="true"
      className={className}
      height={height}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(125,211,252,0.28)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0)" />
        </linearGradient>
        <linearGradient id="trend-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingY + t * (height - paddingY * 2)}
          y2={paddingY + t * (height - paddingY * 2)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {values.length > 1 ? <path d={area} fill="url(#trend-fill)" /> : null}
      <path d={line} fill="none" stroke="url(#trend-stroke)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      <circle cx={lastPoint.x} cy={lastPoint.y} fill="#09111f" r="6.5" stroke="#7dd3fc" strokeWidth="2" />
    </svg>
  );
}

function getExerciseTrend(history: WorkoutSession[], exerciseId: string): Array<{ date: string; value: number }> {
  const points = history
    .map((session) => {
      const match = session.exerciseResults.find((result) => result.exerciseId === exerciseId);
      return match ? { date: session.date, value: match.reps } : null;
    })
    .filter((point): point is { date: string; value: number } => point !== null)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  return points.slice(-10);
}

export function WorkoutTab({
  session,
  currentExercise,
  history,
  elapsedSeconds,
  durationMinutes,
  lastRepForCurrent,
  currentTargetType,
  repDraft,
  setRepDraft,
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
  history: WorkoutSession[];
  elapsedSeconds: number;
  durationMinutes: number;
  lastRepForCurrent: number;
  currentTargetType: ExerciseTargetType;
  repDraft: number;
  setRepDraft: (value: number) => void;
  swapOptions: WorkoutPlanExercise[];
  onLogCurrentExercise: () => void;
  onSkipCurrentExercise: () => void;
  onSwapCurrentExercise: (replacement: WorkoutPlanExercise) => void;
  onFinishWorkout: (note: string) => void;
  onSavePartialWorkout: (note: string) => void;
  onDiscardWorkout: () => void;
  isSessionComplete: boolean;
}) {
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const metricLabel = currentTargetType === "seconds" ? "seconds" : "reps";
  const trendPoints = getExerciseTrend(history, currentExercise.exercise.id);
  const sparkValues = trendPoints.map((point) => point.value);
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
      onFinishWorkout(noteDraft.trim());
      return;
    }

    setConfirmEndEarly(true);
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-accent via-cyan-300 to-accent transition-all"
            style={{ width: `${Math.min(100, (elapsedSeconds / (durationMinutes * 60)) * 100)}%` }}
          />
        </div>

        <div className="flex items-end justify-between gap-4 px-1">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Round {session.currentRound}</p>
            <p className="mt-1 text-sm text-mist/70">{nextCue}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Timer</p>
            <p className="font-display text-3xl leading-none">{formatDuration(elapsedSeconds)}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.16),_transparent_38%),linear-gradient(180deg,_rgba(15,23,42,0.78),_rgba(2,6,23,0.72))] px-5 py-5 shadow-focus">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/60">
              {currentExercise.role === "focus" ? "Focus move" : muscleLabels[currentExercise.exercise.muscleGroup]}
            </p>
            <h3 className="mt-3 text-balance font-display text-4xl font-semibold leading-[0.95] tracking-tight text-white/95 sm:text-5xl">
              {currentExercise.exercise.name.toUpperCase()}
            </h3>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2 text-sm font-semibold text-mist/80">
            {session.currentIndex + 1}/{session.plan.length}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-sm font-semibold">
            <span className="mr-2 uppercase tracking-[0.18em] text-accent">Target:</span>
            <span className="text-white/90">{currentExercise.targetLabel}</span>
          </div>
        </div>

        {currentExercise.exercise.notes ? <p className="mt-4 text-sm text-mist/70">{currentExercise.exercise.notes}</p> : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_14rem]">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Log {metricLabel}</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/5 text-2xl font-semibold text-white/90 transition hover:bg-white/10"
                type="button"
                onClick={() => setRepDraft(Math.max(0, repDraft - (currentTargetType === "seconds" ? 5 : 1)))}
              >
                -
              </button>
              <input
                className="h-16 w-28 rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-2 text-center font-display text-4xl leading-none text-white/95 outline-none sm:w-32"
                min={0}
                type="number"
                value={repDraft}
                onChange={(event) => setRepDraft(Math.max(0, Number(event.target.value) || 0))}
              />
              <button
                className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/5 text-2xl font-semibold text-white/90 transition hover:bg-white/10"
                type="button"
                onClick={() => setRepDraft(repDraft + (currentTargetType === "seconds" ? 5 : 1))}
              >
                +
              </button>
            </div>
            <p className="mt-2 text-sm text-mist/60">Log the total, then move on.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button
            className="w-full rounded-[1.5rem] bg-accent px-5 py-5 font-semibold text-slate-950 transition hover:brightness-110"
            onClick={onLogCurrentExercise}
            type="button"
          >
            {session.currentIndex === session.plan.length - 1 ? "Finish round" : "Next movement"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={onSkipCurrentExercise}
              type="button"
            >
              Skip
            </button>
            <button
              className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => setRestSecondsLeft(30)}
              type="button"
            >
              Quick rest
              <span className="ml-2 text-accent">30s</span>
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Rest</p>
              <p className="font-display text-2xl leading-none text-white/90">{formatDuration(restSecondsLeft)}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[15, 30, 45].map((seconds) => (
                <button
                  key={seconds}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  type="button"
                  onClick={() => setRestSecondsLeft(seconds)}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <details className="group mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-mist/60">More</p>
              <p className="mt-1 text-sm font-medium text-white/90">Swap movement, end workout</p>
            </div>
            <ChevronDownIcon className="h-6 w-6 text-mist/60 transition group-open:rotate-180" />
          </summary>

          <div className="px-4 pb-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Workout note</p>
              <p className="mt-2 text-sm text-mist/70">Optional. Saved with this session and shown in your summary.</p>
              <textarea
                className="mt-3 w-full resize-none rounded-[1.1rem] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-mist/40 focus:border-accent/40"
                placeholder='E.g. "Backpack curls: keep elbows tucked. Add 1-2 reps next time."'
                rows={3}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
              />
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Swap movement</p>
              <p className="mt-2 text-sm text-mist/70">Swap stays in the same muscle group and phase when possible.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {swapOptions.length > 0 ? (
                  swapOptions.map((option) => (
                    <button
                      key={option.exercise.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
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
                <p className="mt-2 text-sm text-mist/75">
                  Save it as a partial session or discard it and return to the dashboard.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    className="w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
                    onClick={() => onSavePartialWorkout(noteDraft.trim())}
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
        </details>
      </div>

      {trendPoints.length > 0 ? (
        <details className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-display text-xl text-white/95">Last time trend</p>
              <p className="mt-1 text-sm text-mist/70">
                {lastRepForCurrent > 0 ? `Latest: ${lastRepForCurrent} ${metricLabel}` : "No log yet"}
              </p>
            </div>
            <ChevronDownIcon className="h-6 w-6 text-mist/60 transition group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/60">
                  {trendPoints.length > 1 ? `Last ${trendPoints.length} sessions` : "Last session"}
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-mist/60">
                  Range {Math.min(...sparkValues)}–{Math.max(...sparkValues)} {metricLabel}
                </p>
              </div>
              <div className="mt-4">
                <LineChart className="text-accent" values={sparkValues} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-mist/60">
                <span>{new Date(trendPoints[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <span>{new Date(trendPoints[trendPoints.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </div>
        </details>
      ) : null}

      <details className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
          <p className="font-display text-xl text-white/95">Session totals</p>
          <ChevronDownIcon className="h-6 w-6 text-mist/60 transition group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-mist/60">
            <span>Exercise</span>
            <span>Logged</span>
          </div>
          <div className="mt-4 space-y-3">
            {session.plan.map((item) => {
              const loggedTotal = session.totals[item.exercise.id] ?? 0;
              const skippedRounds = session.skippedRoundsByExercise[item.exercise.id] ?? 0;
              const rightValue = loggedTotal > 0 ? `${loggedTotal}` : item.targetLabel;

              return (
                <div
                  key={item.exercise.id}
                  className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white/95">{item.exercise.name}</p>
                    <p className="mt-1 text-xs text-mist/60">
                      {item.role === "focus" ? "Focus" : muscleLabels[item.exercise.muscleGroup]}
                      {skippedRounds > 0 ? ` · Skipped ${skippedRounds}` : null}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl leading-none text-white/95">{rightValue}</p>
                    <p className="mt-1 text-xs text-mist/60">{loggedTotal > 0 ? "Total" : "Target"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </section>
  );
}
