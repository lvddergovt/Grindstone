# GetInShape Backlog

This backlog tracks what is already in place, what is still missing for the MVP, and what can wait until after the MVP is working well.

## Current Status

### Done

- local-first Vite + React + TypeScript scaffold
- Tailwind setup
- PWA configuration and icons
- Daily Reps workout data imported into the app
- daily workout generation by muscle group and phase
- guided workout flow with timer, rounds, and rep logging
- local persistence for settings, history, streaks, XP, and badges
- basic progress screen
- phase tracking in settings

### Partially Done

- workout builder:
  - equipment-aware logic exists
  - equipment selection UI does not
- progression suggestions:
  - simple post-workout notes exist
  - deeper progression rules do not
- today screen:
  - daily workout is shown
  - last workout summary is still minimal
- gamification:
  - streaks, XP, level, and badges exist
  - challenge and quest systems do not

## MVP Priorities

These are the most important items to finish before calling the product a real MVP.

### 1. Onboarding

Status: not implemented

To do:

- add first-run onboarding flow
- collect user name or nickname
- collect available equipment
- collect preferred workout days
- collect starting phase for each muscle group
- collect preferred workout duration
- add option to skip and use sensible defaults

Why it matters:

- reduces setup friction
- makes workout generation more accurate
- keeps settings out of the main app until needed

### 2. Equipment Setup UI

Status: missing in the interface

To do:

- add toggles for:
  - bodyweight
  - chair
  - backpack
  - kettlebell
  - pull-up bar
- save equipment choices in settings
- show warnings when a selected phase depends on equipment the user does not have

Why it matters:

- the workout engine already uses equipment data
- the user currently cannot control it from the app

### 3. Workout Day Scheduling

Status: partially implemented

To do:

- let the user choose workout days in setup
- let the user choose rest days
- use the selected schedule to compute today's focus
- support a default plan based on the PDF sample week
- show "today is rest day" more intentionally

Why it matters:

- the current schedule is hardcoded
- this should reflect the user's actual training rhythm

### 4. Better Workout Builder Controls

Status: partially implemented

To do:

- add "swap movement" before starting a workout
- add "skip movement" during a workout
- add "too hard" and "too easy" feedback buttons
- allow regenerating just the focus movement
- show why a movement was chosen:
  - muscle group
  - phase
  - focus role

Why it matters:

- makes the app feel adaptive instead of rigid
- lowers the chance of getting stuck on awkward or unavailable movements

### 5. Workout Completion Summary

Status: partially implemented

To do:

- create a dedicated summary screen after finishing a workout
- show:
  - total reps
  - rounds completed
  - total session time
  - XP earned
  - streak impact
  - improvement vs last session
- show a single clear progression recommendation

Why it matters:

- this is one of the best moments for motivation
- currently the user jumps to progress, which is less satisfying

### 6. Progress Tracking Improvements

Status: partially implemented

To do:

- show recent workout history list
- show reps over time
- show rounds over time
- show best workouts
- show per-muscle phase status clearly
- show total workouts completed
- show weekly consistency view

Why it matters:

- visible progress is one of the core reasons for building this app

### 7. Collectible Exercise Unlocks + Trophy Tracker

Status: not implemented

To do:

- add an exercise library view that shows all exercise names
- show locked exercises with a clear collectible treatment:
  - greyed out card or row
  - lock icon
  - unlock hint or requirement
- define unlock rules tied to progression:
  - exercise unlocked
  - phase reached
  - badge earned
  - level milestone
- add a visible unlock progress bar:
  - exercises unlocked out of total exercises
  - XP or level progress to next unlock when relevant
- create a trophy or tracker screen that highlights collectible stats:
  - exercises collected
  - levels reached
  - badges collected
  - phase milestones reached
- make the motivation layer feel more quest-like:
  - unlock moments
  - collection language
  - trophy-style summaries
  - milestone celebration states
- prioritize the visual design of this system so it feels like a core product loop instead of a hidden settings area

Why it matters:

- this creates a stronger reason to come back beyond just logging reps
- it turns the exercise library into a collectible system the user can complete over time
- it gives the app a clearer game loop: train, unlock, level up, collect
- this should become one of the most visually distinctive parts of the app

### 8. Real Progression Engine

Status: basic placeholder only

To do:

- track performance by movement over time
- suggest progression after repeated strong sessions
- suggest easier alternatives after repeated low performance or skips
- detect when a movement is probably too easy
- suggest phase upgrades per muscle group
- separate progression logic for:
  - rep-based movements
  - time-based movements like planks

Why it matters:

- this is one of the most important ideas in the original program
- it turns the app into a real coach instead of just a logger

### 9. Data Model Cleanup

Status: needs improvement

To do:

- normalize exercise metadata more cleanly
- distinguish rep-based vs timed exercises
- support weighted variants more explicitly
- store session notes and skipped movements
- store more useful workout summary fields

Why it matters:

- several future features depend on cleaner session data

## Important UX Improvements

These are still MVP-relevant, but can follow right after the items above.

### Workout Flow UX

- add explicit rest timer presets
- add quick rep buttons
- add keep-screen-awake support or guidance
- make it easier to correct the previous entry
- confirm before ending a workout accidentally
- allow pausing a workout

### Motivation UX

- show encouraging micro-copy after sessions
- add milestone celebrations
- add a clearer XP-to-next-level indicator
- add weekly mini-goals
- add phase-up celebration moments
- make exercise unlocks feel collectible instead of merely available
- add a trophy-room style tracker for unlocked exercises, badges, and level milestones
- frame progression as quests, unlocks, and milestone hunts without making it feel punishing

### Recovery UX

- improve recovery day screen
- suggest walk, stretch, mobility, or reset actions
- avoid making rest days feel like failure

## Visual / Product Polish

Not the focus right now, but worth tracking.

- stronger visual identity
- improved spacing and hierarchy
- more polished mobile interactions
- clearer empty states
- more distinct workout mode styling
- smoother transitions between screens

## Nice-to-Have After MVP

These should wait until the core experience feels solid.

- import/export local data
- backup JSON file
- custom workout templates
- editable exercise library
- workout notes per day
- weekly challenge system
- personal records view
- offline-first production install flow improvements
- better install guidance for iPhone Home Screen

## Not For Now

Keep these out of scope for the current phase.

- accounts
- cloud sync
- App Store release
- subscriptions
- social feed
- friend leaderboards
- push notifications
- Apple Health integration
- video coaching library

## Recommended Build Order

If we keep moving in a practical sequence, this is the order I would suggest:

1. onboarding
2. equipment and workout day setup
3. workout builder controls: swap, skip, difficulty feedback
4. dedicated workout summary screen
5. improved progress dashboard
6. collectible exercise unlocks and trophy tracker
7. real progression engine
8. UX and visual polish
