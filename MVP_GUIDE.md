# GetInShape MVP Guide

## Product Goal

Build a local-first, mobile-friendly workout web app that turns the Daily Reps PDF into a guided daily routine with visible progress and light gamification.

This app is for personal use at home first:

- no App Store
- no paid hosting
- no backend
- works on the same Wi-Fi network
- can be added to the iPhone home screen

## Recommended MVP Stack

Use the lowest-cost stack that still supports a good mobile experience:

- Vite
- React
- TypeScript
- Tailwind CSS
- PWA support
- localStorage for MVP data

### Why this stack

- Vite is simpler and lighter than Next.js for a personal local app.
- React gives us a solid UI model for workout flows and state-heavy screens.
- TypeScript helps keep workout logic and progress rules safe.
- Tailwind is fast for building a clean mobile-first UI.
- PWA support makes it possible to add the app to the iPhone home screen.
- localStorage keeps costs at zero and removes backend complexity.

## Product Principles

The source program emphasizes:

- short workouts
- consistency over intensity
- easy home setup
- body-part-specific progression
- low friction
- daily wins

The app should follow those same rules:

- guide, do not overwhelm
- celebrate consistency, not perfection
- make progress visible
- reduce workout setup friction
- support mixed phases across muscle groups

## Core Training Model

The PDF program works like this:

1. Choose one movement for each body part:
   - arms/chest
   - legs
   - abs
   - back
2. Add 1 or 2 extra focus movements.
3. Run a circuit for up to 20 minutes.
4. Complete as many rounds and reps as possible.
5. Progress per body part when movements become too easy.

The app should preserve that model instead of replacing it.

## MVP Feature Set

### 1. Onboarding

Purpose: make the plan feel personalized without creating too much setup.

Required fields:

- name or nickname
- workout days
- available equipment
- current phase for each muscle group
- default workout duration

Suggested defaults:

- workout duration: 15 minutes
- beginner-friendly preset
- equipment options:
  - bodyweight only
  - backpack
  - kettlebell
  - pull-up bar
  - chair

### 2. Today Screen

Purpose: give one clear action every day.

Required content:

- today's focus
- current streak
- quick summary of last workout
- "Start workout" button
- today's generated movement list

Behavior:

- if the user has a weekly schedule, show the scheduled focus
- if not, suggest the next focus automatically
- if it is a rest day, show a recovery/rest message

### 3. Workout Builder

Purpose: convert the PDF rules into a simple automatic system.

Required logic:

- choose 1 movement from each body part based on the user's current phase
- choose 1 focus movement based on the day's target
- optionally allow a 6th movement later, but not required for MVP
- filter out movements that require equipment the user does not have
- allow "swap movement" before starting

Output:

- a 5-movement circuit for the session

### 4. Guided Workout Mode

Purpose: make the workout easy to follow on a phone while exercising.

Required elements:

- visible session timer
- current movement
- rep input
- next movement button
- rounds completed
- finish workout button

Nice-to-have but still MVP-friendly:

- quick rest timer presets
- large tap targets
- keep screen awake note or prompt

Data to capture:

- total session length
- movements completed
- reps per movement
- rounds completed
- session notes

### 5. Progress Tracking

Purpose: turn effort into visible momentum.

Required stats:

- current streak
- total workouts completed
- workouts this week
- total reps logged
- rounds completed over time

Useful comparisons:

- compared to last workout
- compared to last week
- best workout this month

### 6. Per-Muscle Phase Tracking

Purpose: support one of the most important ideas in the PDF.

Required behavior:

- store a separate phase for:
  - arms/chest
  - legs
  - abs
  - back
- allow manual phase changes
- show current phase clearly in profile/settings

### 7. Progression Suggestions

Purpose: surface the PDF's progression logic at the right time.

For MVP, this can be simple:

- if performance improves for the same movement across 2 sessions, suggest increasing difficulty
- if user reports movement feels too easy, suggest the next phase
- if user struggles or skips often, suggest an easier swap

Examples:

- "You beat your last total by 12%. Ready to level up legs?"
- "Push-ups looked strong for two sessions in a row. Try the next variation?"

### 8. Light Gamification

Purpose: make consistency more rewarding.

Keep this simple in v1.

Required:

- streak counter
- XP for completed workouts
- level based on XP
- milestone badges

Suggested badge ideas:

- first workout
- 3-day streak
- 5 workouts completed
- 100 total reps
- phase upgrade unlocked

Avoid:

- punishing streak systems
- overly complex achievements
- social features in MVP

## MVP Screens

Keep the first version small.

### Screen 1: Onboarding

- choose days
- choose equipment
- choose starting phases
- set workout duration

### Screen 2: Home / Today

- today's focus
- streak
- start workout
- today's movement list

### Screen 3: Workout

- timer
- current movement
- rep entry
- next
- rounds count

### Screen 4: Summary

- workout complete
- total reps
- rounds
- XP earned
- progress message

### Screen 5: Progress

- streak
- weekly activity
- reps over time
- badges
- current phases

## Data Model for MVP

Keep the data model small and local.

### User Settings

- name
- workoutDays
- equipment
- workoutDurationMinutes
- phaseByMuscleGroup

### Exercise

- id
- name
- muscleGroup
- phase
- equipmentNeeded
- instructions

### Workout Session

- id
- date
- focus
- durationMinutes
- completed
- roundsCompleted
- totalReps
- exerciseResults

### Exercise Result

- exerciseId
- reps
- skipped
- notes

### Progress

- streakCount
- totalXp
- level
- badges

## Local Storage Plan

For MVP, store data in localStorage under a few clear keys:

- user settings
- exercise catalog
- workout history
- progression state
- achievements

If localStorage feels too limiting later, upgrade to IndexedDB without changing the product design.

## What We Are Not Building Yet

To keep the app focused and cheap, do not include these in v1:

- accounts
- cloud sync
- paid hosting
- community feed
- friend challenges
- Apple Health integration
- push notifications
- video library
- advanced analytics

## Suggested MVP Milestones

### Milestone 1: Foundations

- scaffold Vite app
- add Tailwind
- add PWA support
- create exercise data from the PDF

### Milestone 2: Core Flow

- onboarding
- today screen
- workout builder
- guided workout screen

### Milestone 3: Persistence

- save settings locally
- save workout history
- save streak and XP

### Milestone 4: Motivation Layer

- progress screen
- badges
- progression suggestions

## Success Criteria for v1

The MVP is successful if:

- it is faster to use than the PDF
- it removes the need to manually plan each workout
- it makes progress easy to see
- it feels motivating enough to use consistently
- it works well on an iPhone browser and home screen

## Build Recommendation

When implementation starts, optimize for:

- mobile-first layout
- large buttons
- minimal text during workouts
- low-friction logging
- calm but rewarding feedback

The app should feel like a supportive workout companion, not a complicated fitness dashboard.
