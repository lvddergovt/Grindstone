# Grindstone

Local-first workout companion for the Daily Reps style training plan.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- PWA support
- localStorage persistence

## Goals

- run locally on a laptop
- open on an iPhone over the same Wi-Fi
- add to iPhone home screen
- no hosting or backend required

## Deploy (GitHub Pages)

1. Push this repo to GitHub (default branch: `main`).
2. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Commit + push to `main` to trigger the workflow.
4. Check **Actions** for the run and the published URL.

## Commands

Install dependencies:

```bash
npm install
```

Start the local dev server on your network:

```bash
npm run dev
```

Build a production version:

```bash
npm run build
```

Preview the production build on your network:

```bash
npm run preview
```

## MVP areas

- Today screen
- workout builder
- workout logging
- progress tracking
- phase tracking per muscle group
- light gamification

See [MVP_GUIDE.md](./MVP_GUIDE.md) for the product plan.
