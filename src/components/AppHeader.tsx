export function AppHeader({ name, level }: { name: string; level: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <header className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(9,17,31,0.98))] px-4 py-3 shadow-focus">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist/70">Grindstone</p>
          <h1 className="mt-1 truncate font-display text-xl font-semibold leading-tight text-white/95">{name}</h1>
        </div>

        <div className="relative shrink-0">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/90 shadow-sm backdrop-blur">
            {initials || "A"}
          </div>
          <div className="absolute -bottom-1 -left-1 rounded-full border border-white/10 bg-ink/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent shadow-sm">
            Lv {level}
          </div>
        </div>
      </div>
    </header>
  );
}
