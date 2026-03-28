import { SetupForm } from "./SetupForm";
import type { Equipment, Phase, UserSettings, Weekday } from "../types";

export function OnboardingFlow({
  settings,
  onNameChange,
  onDurationChange,
  onEquipmentToggle,
  onWorkoutDayToggle,
  onPhaseChange,
  onComplete,
  onSkip
}: {
  settings: UserSettings;
  onNameChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onEquipmentToggle: (value: Equipment) => void;
  onWorkoutDayToggle: (value: Weekday) => void;
  onPhaseChange: (group: keyof UserSettings["phaseByMuscleGroup"], value: Phase) => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const displayName = settings.name.trim() || "Athlete";

  return (
    <section className="space-y-6 pb-10">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.2),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(9,17,31,0.98))] px-5 py-6 shadow-focus">
        <p className="text-xs uppercase tracking-[0.32em] text-mist/70">First-run setup</p>
        <h1 className="mt-4 font-display text-4xl leading-none">Let&apos;s build {displayName}&apos;s plan.</h1>
        <p className="mt-4 max-w-[22rem] text-sm leading-6 text-mist/75">
          A quick setup makes today&apos;s workout feel personal from the first session and keeps recovery days honest.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm text-mist/75">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Schedule-aware workouts</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Real equipment only</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Separate muscle phases</span>
        </div>
      </div>

      <SetupForm
        settings={settings}
        onNameChange={onNameChange}
        onDurationChange={onDurationChange}
        onEquipmentToggle={onEquipmentToggle}
        onWorkoutDayToggle={onWorkoutDayToggle}
        onPhaseChange={onPhaseChange}
      />

      <div className="space-y-3">
        <button
          className="w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
          type="button"
          onClick={onComplete}
        >
          Finish setup
        </button>
        <button
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
          type="button"
          onClick={onSkip}
        >
          Skip for now
        </button>
      </div>
    </section>
  );
}
