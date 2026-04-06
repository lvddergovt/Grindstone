import type { AppTab } from "../types";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/40 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-mist/55">{label}</p>
      <p className="mt-2 font-medium text-white">{value}</p>
    </div>
  );
}

export function BottomNav({
  current,
  onClick,
  workoutEnabled
}: {
  current: AppTab;
  onClick: (value: AppTab) => void;
  workoutEnabled: boolean;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-2 border-t border-white/10 bg-ink/90 px-5 py-4 backdrop-blur">
      <NavButton current={current} label="Today" value="today" onClick={onClick} />
      <NavButton current={current} label="Workout" value="workout" onClick={onClick} disabled={!workoutEnabled} />
      <NavButton current={current} label="Progress" value="progress" onClick={onClick} />
      <NavButton current={current} label="Trophies" value="trophies" onClick={onClick} />
      <NavButton current={current} label="Settings" value="settings" onClick={onClick} />
    </nav>
  );
}

function NavButton({
  current,
  label,
  value,
  onClick,
  disabled
}: {
  current: AppTab;
  label: string;
  value: AppTab;
  onClick: (value: AppTab) => void;
  disabled?: boolean;
}) {
  const active = current === value || (current === "setup" && value === "settings");
  return (
    <button
      className={`flex-1 rounded-full px-2 py-3 text-xs font-medium transition sm:px-3 sm:text-sm ${
        active ? "bg-white text-slate-950" : "bg-white/5 text-mist/80"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
