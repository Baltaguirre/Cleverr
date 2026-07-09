# Cleverr · Learning Framework

A web app to run a structured **5-stage learning framework** for practical skills.
Create a "topic" (Figma, React, photography…) and take it through the five stages
until you can teach it back.

## The five stages

1. **Diagnosis** — where you start and where you are going
2. **Territory Map** — the concepts, dependencies and gaps of the skill
3. **Attack Plan** — the output project, milestones and first action
4. **Execution Cycle** — repeatable acquire → practice → break → reflect cycles
5. **Consolidation** — lock in what you learned and how you would teach it

## Stack

- **React 18** + **Vite**
- **localStorage** for persistence (MVP — no backend, no auth)
- **Plain CSS** (no Tailwind, no UI libraries)
- **Deploy:** Vercel (`vercel --prod`)

No extra dependencies: clone and run with `npm install && npm run dev`.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Code conventions

- All identifiers, comments and UI copy are in **English**.
- Components and helpers are written as **arrow functions**; the codebase targets **ES2023**.
- State lives in a single `useTopics` hook and is mirrored to `localStorage`
  (key: `lf_topics`) on every change.

## Git workflow

- `main` — stable branch.
- `dev` — integration branch for ongoing work; branch features off `dev` and
  merge back before promoting to `main`.
