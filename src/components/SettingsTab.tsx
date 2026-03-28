import { SetupForm } from "./SetupForm";
import type { Equipment, Phase, UserSettings, Weekday } from "../types";

export function SettingsTab({
  settings,
  onNameChange,
  onDurationChange,
  onEquipmentToggle,
  onWorkoutDayToggle,
  onPhaseChange
}: {
  settings: UserSettings;
  onNameChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onEquipmentToggle: (value: Equipment) => void;
  onWorkoutDayToggle: (value: Weekday) => void;
  onPhaseChange: (group: keyof UserSettings["phaseByMuscleGroup"], value: Phase) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Setup</p>
        <h2 className="mt-3 font-display text-2xl">Keep your plan current</h2>
        <p className="mt-2 text-sm text-mist/75">
          Update your schedule, equipment, or starting phases anytime. Today&apos;s workout will use these choices right away.
        </p>
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
