# Solo System

Solo System is a local-first personal life progression tracker built with React, TypeScript, Vite, Tailwind CSS, and Dexie.

## Milestone 1 scope

This milestone establishes the application foundation:

- Strict TypeScript React + Vite app setup.
- Tailwind styling with original design tokens.
- Accessible responsive shell and route placeholders for Dashboard, Trackers, Calendar, Goals, Analytics, and Settings.
- Infrastructure boundary for Dexie persistence with schema versioning and injectable clock/ID providers.
- Foundational test setup with Vitest and Playwright.

## Development

```bash
npm install
npm run dev
```

## Verification commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
npm run check
```

`npm run check` runs typecheck + lint + unit tests + production build, suitable for CI pipelines.

> Playwright requires browser binaries. Run `npx playwright install` if they are missing.
