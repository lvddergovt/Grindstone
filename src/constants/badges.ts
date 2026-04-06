export type BadgeDefinition = {
  name: string;
  description: string;
  hint: string;
  imageSrc?: string;
};

export const badgeCatalog: BadgeDefinition[] = [
  {
    name: "First workout",
    description: "You showed up and set the baseline.",
    hint: "Finish your first workout."
  },
  {
    name: "3-day streak",
    description: "Three training days in a row. Momentum is real.",
    hint: "Train on three straight days."
  },
  {
    name: "5 workouts",
    description: "Five logged sessions. This is becoming a habit.",
    hint: "Log five workouts."
  },
  {
    name: "100 reps",
    description: "You have stacked 100 total reps across sessions.",
    hint: "Reach 100 total reps."
  },
  {
    name: "3-round finisher",
    description: "You pushed through three full rounds in one workout.",
    hint: "Complete three rounds in a session."
  }
];

export function getBadgeDefinition(name: string): BadgeDefinition {
  return (
    badgeCatalog.find((badge) => badge.name === name) ?? {
      name,
      description: "Progress unlocked.",
      hint: "Keep training to discover this trophy."
    }
  );
}
