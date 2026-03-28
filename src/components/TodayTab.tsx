import { exercises } from "../data/exercises";
import { focusLabels, muscleLabels } from "../constants/labels";
import type { FocusDay, WorkoutPlanExercise } from "../types";
import { Stat } from "./Surface";

export function TodayTab({
  focus,
  durationMinutes,
  streakCount,
  workoutPlan,
  completedThisWeek,
  onStartWorkout
}: {
  focus: FocusDay;
  durationMinutes: number;
  streakCount: number;
  workoutPlan: WorkoutPlanExercise[];
  completedThisWeek: number;
  onStartWorkout: () => void;
}) {
  return (
    <section className="space-y-5">
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

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Workouts this week" value={String(completedThisWeek)} />
        <Stat label="Exercise library" value={String(exercises.length)} />
      </div>
    </section>
  );
}
