import { focusLabels } from "../constants/labels";
import { formatDuration } from "../lib/session";
import type { WorkoutSummaryData } from "../types";

const badgeDescriptions: Record<string, string> = {
  "First workout": "You showed up and set the baseline.",
  "3-day streak": "Three training days in a row. Momentum is real.",
  "5 workouts": "Five logged sessions. This is becoming a habit.",
  "100 reps": "You have stacked 100 total reps across sessions.",
  "3-round finisher": "You pushed through three full rounds in one workout."
};

export function WorkoutSummary({
  summary,
  onContinue,
  onOpenProgress
}: {
  summary: WorkoutSummaryData;
  onContinue: () => void;
  onOpenProgress: () => void;
}) {
  const streakDelta = summary.streakCount - summary.previousStreakCount;
  const previousSession = summary.previousSession;
  const repsDelta = previousSession ? summary.session.totalReps - previousSession.totalReps : null;
  const roundsDelta = previousSession ? summary.session.roundsCompleted - previousSession.roundsCompleted : null;

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-glow/20 bg-gradient-to-br from-glow/20 via-white/8 to-white/5 px-5 py-6 shadow-[0_20px_80px_rgba(125,211,252,0.12)]">
        <p className="text-xs uppercase tracking-[0.24em] text-glow/80">Workout complete</p>
        <h2 className="mt-3 font-display text-3xl">Strong finish on {focusLabels[summary.session.focus]} day</h2>
        <p className="mt-3 text-sm text-mist/80">
          {summary.session.totalReps > 0
            ? "Session logged. Your progress is saved, your streak is updated, and your next step is clear."
            : "You wrapped the session and kept the habit alive. Even lighter days still count."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <HighlightStat label="Total reps" value={String(summary.session.totalReps)} />
          <HighlightStat label="Rounds" value={String(summary.session.roundsCompleted)} />
          <HighlightStat label="Duration" value={formatDuration(summary.durationSeconds)} />
          <HighlightStat label="XP earned" value={`+${summary.gainedXp}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Streak impact</p>
          <p className="mt-2 font-display text-2xl">{renderStreakHeadline(summary.streakCount, streakDelta)}</p>
          <p className="mt-2 text-sm text-mist/75">{renderStreakBody(summary.streakCount, streakDelta)}</p>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Progression note</p>
          <p className="mt-2 text-base text-white">
            {summary.session.progressionNotes?.[0] ??
              "Keep stacking clean reps. Consistency is what unlocks the next level."}
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Compared with last workout</p>
            <h3 className="mt-2 font-display text-xl">{previousSession ? "Your trend at a glance" : "First session logged"}</h3>
          </div>
          {previousSession ? (
            <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">
              {focusLabels[previousSession.focus]}
            </div>
          ) : null}
        </div>

        {previousSession ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <ComparisonStat label="Reps" value={formatDelta(repsDelta)} />
            <ComparisonStat label="Rounds" value={formatDelta(roundsDelta)} />
            <ComparisonStat
              label="Time"
              value={formatMinuteDelta(summary.session.durationMinutes - previousSession.durationMinutes)}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-mist/75">
            This is your first logged workout, so from here on out you have a benchmark to beat.
          </p>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Badges</p>
            <h3 className="mt-2 font-display text-xl">
              {summary.unlockedBadges.length > 0 ? "New unlocks" : "No new badge this time"}
            </h3>
          </div>
          <div className="rounded-full bg-glow/10 px-3 py-2 text-sm text-glow">{summary.streakCount} day streak</div>
        </div>

        {summary.unlockedBadges.length > 0 ? (
          <div className="mt-4 space-y-3">
            {summary.unlockedBadges.map((badge) => (
              <div key={badge} className="rounded-[1.25rem] border border-glow/20 bg-glow/8 px-4 py-4">
                <p className="font-medium text-glow">{badge}</p>
                <p className="mt-1 text-sm text-mist/75">{badgeDescriptions[badge] ?? "Progress unlocked."}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-mist/75">
            Keep the chain going. Your next badge usually comes from streaks, total workouts, or bigger session volume.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          className="rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
          onClick={onContinue}
          type="button"
        >
          Back to today
        </button>
        <button
          className="rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
          onClick={onOpenProgress}
          type="button"
        >
          Open progress dashboard
        </button>
      </div>
    </section>
  );
}

function HighlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/35 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

function ComparisonStat({ label, value }: { label: string; value: string }) {
  const positive = value.startsWith("+");
  const neutral = !positive && !value.startsWith("-");

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{label}</p>
      <p className={`mt-2 font-display text-2xl ${neutral ? "text-white" : positive ? "text-emerald-300" : "text-rose-300"}`}>{value}</p>
    </div>
  );
}

function renderStreakHeadline(streakCount: number, streakDelta: number): string {
  if (streakDelta > 0) return `${streakCount}-day streak`;
  if (streakCount > 0) return `Streak held at ${streakCount}`;
  return "Fresh start";
}

function renderStreakBody(streakCount: number, streakDelta: number): string {
  if (streakDelta > 0) return "You extended the chain today. Keep tomorrow alive and the habit gets easier.";
  if (streakCount > 0) return "Your streak stays on the board. A session tomorrow will start pushing it higher again.";
  return "Today resets the board and gives you a clean line to build from.";
}

function formatDelta(value: number | null): string {
  if (value === null) return "--";
  if (value === 0) return "Even";
  return value > 0 ? `+${value}` : String(value);
}

function formatMinuteDelta(value: number): string {
  if (value === 0) return "Even";
  return value > 0 ? `+${value} min` : `${value} min`;
}
