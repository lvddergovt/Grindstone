import { SetupForm } from "./SetupForm";
import type { Equipment, Phase, UserSettings, Weekday } from "../types";

export function SetupTab({
  settings,
  onNameChange,
  onDurationChange,
  onEquipmentToggle,
  onWorkoutDayToggle,
  onPhaseChange,
  onBack
}: {
  settings: UserSettings;
  onNameChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onEquipmentToggle: (value: Equipment) => void;
  onWorkoutDayToggle: (value: Weekday) => void;
  onPhaseChange: (group: keyof UserSettings["phaseByMuscleGroup"], value: Phase) => void;
  onBack: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Setup</p>
        <h2 className="mt-3 font-display text-2xl">Keep your plan current</h2>
        <p className="mt-2 text-sm text-mist/75">
          Update your schedule, equipment, or starting phases anytime. Today&apos;s workout will use these choices right away.
        </p>
        <button
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          type="button"
          onClick={onBack}
        >
          Back to settings
        </button>
      </div>

      <SetupForm
        settings={settings}
        onNameChange={onNameChange}
        onDurationChange={onDurationChange}
        onEquipmentToggle={onEquipmentToggle}
        onWorkoutDayToggle={onWorkoutDayToggle}
        onPhaseChange={onPhaseChange}
        compact
      />
    </section>
  );
}

