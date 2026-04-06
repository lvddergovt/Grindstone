import { badgeCatalog } from "../constants/badges";
import { levelFromXp } from "../lib/workout";
import type { ProgressState } from "../types";
import { Stat } from "./Surface";

export function TrophiesTab({ progress }: { progress: ProgressState }) {
  const unlockedCount = badgeCatalog.filter((badge) => progress.badges.includes(badge.name)).length;
  const collectionProgress = badgeCatalog.length > 0 ? (unlockedCount / badgeCatalog.length) * 100 : 0;
  const level = levelFromXp(progress.totalXp);
  const xpIntoLevel = progress.totalXp % 250;
  const xpToNextLevel = 250 - xpIntoLevel || 250;

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(9,17,31,0.98))] px-5 py-6 shadow-[0_24px_80px_rgba(251,191,36,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-200/70">Trophy room</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Your medal collection</h2>
            <p className="mt-2 text-sm text-mist/75">
              Unlocked trophies stay bright. Locked ones stay on the board so you can chase the next milestone.
            </p>
          </div>
          <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
            {unlockedCount}/{badgeCatalog.length}
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-glow transition-all"
            style={{ width: `${collectionProgress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-mist/70">{Math.round(collectionProgress)}% of badge trophies collected.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Trophies unlocked" value={String(unlockedCount)} />
        <Stat label="Locked trophies" value={String(Math.max(0, badgeCatalog.length - unlockedCount))} />
        <Stat label="Current level" value={String(level)} />
        <Stat label="Current streak" value={`${progress.streakCount} days`} />
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Next level</p>
            <h3 className="mt-2 font-display text-xl">Keep stacking XP</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">{xpToNextLevel} XP left</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-glow transition-all" style={{ width: `${(xpIntoLevel / 250) * 100}%` }} />
        </div>
        <p className="mt-3 text-sm text-mist/75">
          Level progress feeds the same motivation loop as your trophies, so this page can grow into the full collectible tracker later.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Badge board</p>
            <h3 className="mt-2 font-display text-xl">Every trophy at a glance</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-2 text-sm text-mist/70">Ready for medal art</div>
        </div>

        <div className="mt-4 grid gap-3">
          {badgeCatalog.map((badge) => {
            const unlocked = progress.badges.includes(badge.name);

            return (
              <div
                key={badge.name}
                className={`rounded-[1.5rem] border px-4 py-4 transition ${
                  unlocked
                    ? "border-amber-300/20 bg-gradient-to-r from-amber-300/12 via-white/6 to-glow/10"
                    : "border-white/8 bg-slate-950/30 opacity-65"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-center ${
                      unlocked
                        ? "border-amber-200/40 bg-[radial-gradient(circle_at_35%_30%,_rgba(255,255,255,0.55),_rgba(251,191,36,0.2)_35%,_rgba(120,53,15,0.35)_100%)] text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.18)]"
                        : "border-white/10 bg-white/5 text-mist/45"
                    }`}
                  >
                    {badge.imageSrc ? (
                      <img alt={badge.name} className="h-14 w-14 rounded-full object-cover" src={badge.imageSrc} />
                    ) : (
                      <span className="font-display text-lg">{buildMedalMonogram(badge.name)}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-medium ${unlocked ? "text-white" : "text-mist/65"}`}>{badge.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                          unlocked ? "bg-emerald-400/15 text-emerald-200" : "bg-white/5 text-mist/50"
                        }`}
                      >
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${unlocked ? "text-mist/75" : "text-mist/55"}`}>
                      {unlocked ? badge.description : badge.hint}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildMedalMonogram(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
