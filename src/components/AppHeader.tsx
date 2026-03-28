export function AppHeader({ name, level }: { name: string; level: number }) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(9,17,31,0.98))] px-5 py-6 shadow-focus">
      <p className="text-xs uppercase tracking-[0.32em] text-mist/70">Grindstone</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold leading-none">{name}</h1>
          <p className="mt-3 max-w-[16rem] text-sm leading-6 text-mist/75">
            Daily wins, guided circuits, and visible progress from the Daily Reps plan.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Level</p>
          <p className="font-display text-3xl font-bold text-accent">{level}</p>
        </div>
      </div>
    </header>
  );
}
