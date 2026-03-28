import { focusLabels } from "../constants/labels";
import { levelFromXp } from "../lib/workout";
import type { ProgressState, WorkoutSession } from "../types";
import { Stat } from "./Surface";

const badgeDescriptions: Record<string, string> = {
  "First workout": "You started the streak board.",
  "3-day streak": "Three training days in a row.",
  "5 workouts": "Five workouts logged.",
  "100 reps": "100 total reps across your history.",
  "3-round finisher": "Three full rounds in one session."
};

export function ProgressTab({
  progress,
  history,
  totalRepsAllTime
}: {
  progress: ProgressState;
  history: WorkoutSession[];
  totalRepsAllTime: number;
}) {
  const latest = history[0];
  const previous = history[1];
  const averageReps = history.length > 0 ? Math.round(totalRepsAllTime / history.length) : 0;
  const totalRounds = history.reduce((sum, session) => sum + session.roundsCompleted, 0);
  const level = levelFromXp(progress.totalXp);
  const xpIntoLevel = progress.totalXp % 250;
  const xpToNextLevel = 250 - xpIntoLevel || 250;

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-sky-400/10 px-5 py-6">
        <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Progress dashboard</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Level {level}</h2>
            <p className="mt-2 text-sm text-mist/75">
              {history.length > 0
                ? `${progress.totalXp} XP earned so far. ${xpToNextLevel} XP to the next level.`
                : "Complete your first workout to start filling this dashboard."}
            </p>
          </div>
          <div className="rounded-full bg-glow/10 px-4 py-2 text-sm font-medium text-glow">{progress.streakCount} day streak</div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-glow transition-all" style={{ width: `${(xpIntoLevel / 250) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total XP" value={String(progress.totalXp)} />
        <Stat label="Workouts logged" value={String(history.length)} />
        <Stat label="Total reps" value={String(totalRepsAllTime)} />
        <Stat label="Avg reps / workout" value={String(averageReps)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Rounds completed" value={String(totalRounds)} />
        <Stat label="Badges unlocked" value={String(progress.badges.length)} />
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Momentum</p>
            <h3 className="mt-2 font-display text-xl">Latest workout vs previous</h3>
          </div>
          {latest ? (
            <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">{focusLabels[latest.focus]}</div>
          ) : null}
        </div>
        {latest ? (
          <>
            <p className="mt-3 text-sm text-mist/75">
              {previous
                ? buildComparisonCopy(latest, previous)
                : "Your first workout is in the books. Next session gives you a clear number to beat."}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <DeltaCard label="Reps" current={latest.totalReps} previous={previous?.totalReps} />
              <DeltaCard label="Rounds" current={latest.roundsCompleted} previous={previous?.roundsCompleted} />
              <DeltaCard label="Duration" current={latest.durationMinutes} previous={previous?.durationMinutes} suffix="m" />
            </div>
            {latest.progressionNotes?.length ? (
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Progression note</p>
                <p className="mt-2 text-sm text-mist/80">{latest.progressionNotes[0]}</p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-sm text-mist/75">Complete your first session to see your trend line and session comparisons.</p>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Badges</p>
            <h3 className="mt-2 font-display text-xl">What you have unlocked</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">{progress.badges.length} total</div>
        </div>

        {progress.badges.length > 0 ? (
          <div className="mt-4 space-y-3">
            {progress.badges.map((badge) => (
              <div key={badge} className="rounded-[1.25rem] border border-glow/20 bg-glow/8 px-4 py-4">
                <p className="font-medium text-glow">{badge}</p>
                <p className="mt-1 text-sm text-mist/75">{badgeDescriptions[badge] ?? "Progress unlocked."}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-mist/60">No badges yet. Your first workout unlocks the first milestone.</p>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">History</p>
            <h3 className="mt-2 font-display text-xl">Recent sessions</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">{history.length} total</div>
        </div>
        {history.length > 0 ? (
          <div className="mt-4 space-y-3">
            {history.slice(0, 5).map((session) => (
              <div key={session.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{focusLabels[session.focus]}</p>
                    <p className="mt-1 font-medium">{formatSessionDate(session.date)}</p>
                  </div>
                  <div className="rounded-full bg-white/5 px-3 py-2 text-sm text-mist/70">{session.durationMinutes} min</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-mist/80">
                  <span>{session.totalReps} reps</span>
                  <span>{session.roundsCompleted} rounds</span>
                  <span>{session.progressionNotes?.length ? "Progress note saved" : "No note"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-mist/60">No sessions yet. Once you finish one, it will show up here.</p>
        )}
      </div>
    </section>
  );
}

function DeltaCard({
  label,
  current,
  previous,
  suffix = ""
}: {
  label: string;
  current: number;
  previous?: number;
  suffix?: string;
}) {
  const diff = previous === undefined ? null : current - previous;
  const diffLabel = diff === null ? "--" : diff === 0 ? "Even" : `${diff > 0 ? "+" : ""}${diff}${suffix}`;
  const tone = diff === null || diff === 0 ? "text-white" : diff > 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{label}</p>
      <p className="mt-2 font-display text-2xl">{current}{suffix}</p>
      <p className={`mt-1 text-sm ${tone}`}>{diffLabel}</p>
    </div>
  );
}

function buildComparisonCopy(latest: WorkoutSession, previous: WorkoutSession): string {
  const repsDelta = latest.totalReps - previous.totalReps;
  const roundsDelta = latest.roundsCompleted - previous.roundsCompleted;

  if (repsDelta > 0 || roundsDelta > 0) {
    return `Nice jump. You finished ${formatSigned(repsDelta)} reps and ${formatSigned(roundsDelta)} rounds compared with your last session.`;
  }

  if (repsDelta === 0 && roundsDelta === 0) {
    return "Steady work. You matched your previous output, which is a strong sign of consistency.";
  }

  return "This one landed a bit lower than the last workout, but it still keeps the habit moving forward.";
}

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatSessionDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}
