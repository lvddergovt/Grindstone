import { exercises } from "../data/exercises";
import { focusLabels, muscleLabels } from "../constants/labels";
import type { FocusDay, WorkoutPlanExercise } from "../types";
import { Stat } from "./Surface";

export function TodayTab({
  focus,
  durationMinutes,
  streakCount,
  workoutPlan,
  completedToday,
  completedThisWeek,
  onStartWorkout
}: {
  focus: FocusDay;
  durationMinutes: number;
  streakCount: number;
  workoutPlan: WorkoutPlanExercise[];
  completedToday: boolean;
  completedThisWeek: number;
  onStartWorkout: () => void;
}) {
  return (
    <section className="space-y-5">
      {completedToday ? (
        <div className="overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-300/15 via-white/8 to-white/5 px-5 py-6 shadow-[0_20px_80px_rgba(16,185,129,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/90">Workout completed</p>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-200">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl">You&apos;re done for today</h2>
              <p className="mt-2 text-sm text-mist/80">
                Nice work — your streak and progress are already banked. Come back tomorrow for a fresh circuit.
              </p>
            </div>
            <div className="rounded-full bg-glow/15 px-4 py-2 text-sm font-medium text-glow">{streakCount} day streak</div>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Today</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">{focusLabels[focus]}</h2>
                <p className="mt-2 text-sm text-mist/75">
                  {focus === "recovery"
                    ? "Recovery day. Stretch, walk, or reset."
                    : `${durationMinutes} minute circuit with one move per body part plus focus work.`}
                </p>
              </div>
              <div className="rounded-full bg-glow/15 px-4 py-2 text-sm font-medium text-glow">{streakCount} day streak</div>
            </div>
            <button
              className="mt-5 w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onStartWorkout}
              type="button"
              disabled={focus === "recovery"}
            >
              {focus === "recovery" ? "Recovery day" : "Start today's workout"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Today's circuit</h3>
              <span className="text-sm text-mist/60">{workoutPlan.length} moves</span>
            </div>
            {workoutPlan.map((item) => (
              <div key={item.exercise.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-mist/60">
                      {item.role === "focus" ? "Focus move" : muscleLabels[item.exercise.muscleGroup]}
                    </p>
                    <p className="mt-1 font-medium">{item.exercise.name}</p>
                    <p className="mt-2 text-sm text-mist/70">{item.targetLabel}</p>
                    {item.exercise.notes ? <p className="mt-2 text-xs text-mist/55">{item.exercise.notes}</p> : null}
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-mist/70">Phase {item.exercise.phase}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Workouts this week" value={String(completedThisWeek)} />
        <Stat label="Exercise library" value={String(exercises.length)} />
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
