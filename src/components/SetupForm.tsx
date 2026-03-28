import { equipmentLabels, muscleLabels, phaseDescriptions, weekdayLabels } from "../constants/labels";
import type { Equipment, Phase, UserSettings, Weekday } from "../types";

const equipmentOptions: Equipment[] = ["bodyweight", "chair", "backpack", "kettlebell", "pullupBar"];
const weekdayOptions: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const phaseOptions: Phase[] = [1, 2, 3, 4];

export function SetupForm({
  settings,
  onNameChange,
  onDurationChange,
  onEquipmentToggle,
  onWorkoutDayToggle,
  onPhaseChange,
  compact = false
}: {
  settings: UserSettings;
  onNameChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onEquipmentToggle: (value: Equipment) => void;
  onWorkoutDayToggle: (value: Weekday) => void;
  onPhaseChange: (group: keyof UserSettings["phaseByMuscleGroup"], value: Phase) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <h2 className="font-display text-2xl">{compact ? "Plan setup" : "Your setup"}</h2>
        <p className="mt-2 text-sm text-mist/75">
          {compact
            ? "Update your workout schedule, available gear, and current starting phases."
            : "Pick your schedule, available equipment, and starting level so workouts match real life."}
        </p>

        <label className="mt-5 block">
          <span className="text-sm text-mist/70">Name</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none"
            type="text"
            value={settings.name}
            placeholder="What should we call you?"
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm text-mist/70">Workout duration</span>
          <input
            className="mt-2 w-full accent-accent"
            min={10}
            max={20}
            step={5}
            type="range"
            value={settings.workoutDurationMinutes}
            onChange={(event) => onDurationChange(Number(event.target.value))}
          />
          <p className="mt-2 text-sm text-mist/70">{settings.workoutDurationMinutes} minutes</p>
        </label>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">Workout days</h3>
            <p className="mt-2 text-sm text-mist/70">Choose the days you want to train. Unselected days become recovery days.</p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-mist/70">{settings.workoutDays.length} days</div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {weekdayOptions.map((day) => {
            const selected = settings.workoutDays.includes(day);
            return (
              <button
                key={day}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                  selected ? "border-accent bg-accent text-slate-950" : "border-white/10 bg-slate-950/50 text-mist/80"
                }`}
                type="button"
                onClick={() => onWorkoutDayToggle(day)}
              >
                {weekdayLabels[day]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">Equipment</h3>
            <p className="mt-2 text-sm text-mist/70">Select only what you actually have so the workout generator can stay honest.</p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-mist/70">
            {settings.equipment.length} selected
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {equipmentOptions.map((equipment) => {
            const selected = settings.equipment.includes(equipment);
            return (
              <button
                key={equipment}
                className={`rounded-full border px-4 py-3 text-sm font-medium transition ${
                  selected ? "border-accent bg-accent text-slate-950" : "border-white/10 bg-slate-950/50 text-mist/80"
                }`}
                type="button"
                onClick={() => onEquipmentToggle(equipment)}
              >
                {equipmentLabels[equipment]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h3 className="font-display text-xl">Starting phases</h3>
          <p className="mt-2 text-sm text-mist/70">Set each muscle group where you are right now. You can fine-tune this later anytime.</p>
        </div>
        {(Object.keys(settings.phaseByMuscleGroup) as Array<keyof UserSettings["phaseByMuscleGroup"]>).map((group) => (
          <div key={group} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{muscleLabels[group]}</p>
                <p className="mt-1 text-sm text-mist/65">{phaseDescriptions[settings.phaseByMuscleGroup[group]]}</p>
              </div>
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2"
                value={settings.phaseByMuscleGroup[group]}
                onChange={(event) => onPhaseChange(group, Number(event.target.value) as Phase)}
              >
                {phaseOptions.map((phase) => (
                  <option key={phase} value={phase}>
                    Phase {phase}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
