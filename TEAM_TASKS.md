# GetInShape Team Tasks

These instructions split the current MVP work into parallel tracks with minimal merge conflicts.

General rule for everyone:

- do not revert other people's changes
- keep changes inside your assigned files when possible
- if you need shared type changes, keep them small and communicate them
- prefer adding new files over expanding `App.tsx`
- run `npm run build` before handing off work

## Person 1: Onboarding + Setup

### Goal

Build the first-run setup flow so the app feels personalized and the workout engine uses real user choices.

### Main Ownership

- `src/components/SettingsTab.tsx`
- `src/App.tsx`
- `src/types.ts`
- `src/lib/storage.ts`

### Secondary Files

- add new files under `src/components/` if needed

### What To Build

1. First-run onboarding flow
- show onboarding when the app is opened for the first time
- allow the user to complete setup before using the app normally
- allow skipping with sensible defaults if needed

2. Equipment selection UI
- add selectable equipment options:
  - bodyweight
  - chair
  - backpack
  - kettlebell
  - pull-up bar
- save the selected equipment

3. Workout day selection
- let the user choose which days they want to train
- store those days in settings
- prepare the settings so later logic can use them cleanly

4. Starting phase setup
- make phase setup clearer and more intentional
- keep separate phases for:
  - arms/chest
  - legs
  - abs
  - back

5. Settings polish
- make settings editable after onboarding
- keep the flow simple on mobile

### Acceptance Criteria

- a new user gets a setup flow instead of landing in the app unconfigured
- equipment can be selected and saved
- workout days can be selected and saved
- phase selections are clear and saved
- existing users can still edit setup later
- build passes

### Avoid

- do not rewrite workout generation logic unless absolutely necessary
- do not redesign progress tracking
- do not move workout session logic into your branch unless needed

## Person 2: Progress + Summary

### Goal

Make progress feel rewarding and easy to understand, especially right after finishing a workout.

### Main Ownership

- `src/components/ProgressTab.tsx`
- add a new summary component under `src/components/`
- `src/App.tsx`

### Secondary Files

- `src/types.ts` only if you need small additions to workout summary data

### What To Build

No open build items right now. Current scope is complete and this track is available for a new assignment.

### Acceptance Criteria

- completed

### Avoid

- do not own onboarding or equipment setup
- do not deeply change workout generator logic
- do not rewrite the workout screen unless needed for summary handoff

## Person 3: Workout Flow + Progression

### Goal

Make the workout session smarter and more flexible while staying true to the Daily Reps program.

### Main Ownership

- `src/components/WorkoutTab.tsx`
- `src/lib/session.ts`
- `src/lib/workout.ts`

### Secondary Files

- `src/types.ts` for small additions to session data
- `src/App.tsx` only for wiring your new controls

### What To Build

No open build items right now. Current scope is complete and this track is available for a new assignment.

### Acceptance Criteria

- completed

### Avoid

- do not own onboarding
- do not own the progress dashboard except where session output requires it
- do not make large visual redesign decisions

## Shared Coordination Notes

### Safe Shared Files

These files may be touched by multiple people, so be careful:

- `src/App.tsx`
- `src/types.ts`

### Merge Strategy

- keep `App.tsx` changes limited to wiring new components or small state additions
- if you need new UI, add a new file under `src/components/`
- if you need new logic, add a new file under `src/lib/` instead of crowding existing ones

### Suggested Branch / Work Split

- Person 1: `onboarding-setup`
- Person 2: `summary-progress`
- Person 3: `workout-progression`
