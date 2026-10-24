# Solo System Roadmap

## Milestone 0 — Specification and architecture

**Status:** Prepared.

Deliverables:

- Product scope and acceptance criteria.
- Layered architecture and folder structure.
- Domain data model and invariants.
- Incremental roadmap and testing strategy.
- Copilot contribution instructions.

Exit criteria:

- Documents reviewed for consistency.
- MVP boundaries are explicit.
- No implementation work depends on undocumented tracker names or categories.

## Milestone 1 — Application foundation

Build the smallest runnable application:

- Initialize React, TypeScript strict mode, Vite, Tailwind, Vitest, and Playwright.
- Add linting, formatting, typecheck, and production build scripts.
- Establish the folder structure and dependency boundaries.
- Add design tokens, responsive shell, navigation, accessible buttons/forms, and error boundary.
- Add Dexie database wrapper with version 1 and injectable clock/ID providers.
- Add test setup and a CI-ready command sequence.

Checks:

- Typecheck, lint, unit tests, and production build.
- Browser smoke test loads the shell.

## Milestone 2 — Tracker definitions and activity capture

- Implement categories, tracker definitions, field validation, recurrence definitions, and CRUD use cases.
- Implement tracker builder UI for boolean, number, duration, counter, rating, and text fields.
- Implement activity recording, editing, deletion/voiding, and persistence.
- Implement transactional writes and visible persistence errors.

Checks:

- Domain tests for field validation and recurrence.
- IndexedDB integration tests for migrations and CRUD.
- Playwright test for creating a tracker and recording/editing activity.

## Milestone 3 — Progression engine

- Implement XP rules, level thresholds, ranks, attributes, and append-only ledger.
- Add idempotent awards and correction entries.
- Connect activity recording to progression atomically.
- Add dashboard level/rank/attribute cards and recent progression activity.

Checks:

- Unit tests for boundary levels, caps, duplicate commands, corrections, and rule versions.
- Integration tests verifying atomic activity plus ledger updates.
- E2E test that records an activity and verifies XP.

## Milestone 4 — Calendar, streaks, and quests

- Implement schedule-aware streak calculations.
- Add daily/weekly/monthly calendar views incrementally.
- Add completion indicators and contribution heatmap.
- Implement quest definitions, instances, progress, completion, and rewards.

Checks:

- Tests for weekday schedules, monthly schedules, missed occurrences, time zones, DST, and leap years.
- E2E test for calendar history and quest completion.

## Milestone 5 — Goals, projects, and analytics

- Add goals, projects, milestones, linked tracker aggregation, deadlines, and status changes.
- Add completion-rate, trend, consistency, personal-record, and goal-progress analytics.
- Add filters and accessible chart alternatives/data tables.

Checks:

- Domain tests for aggregation and goal completion.
- Integration tests for derived read models.
- E2E test for creating a goal and observing linked progress.

## Milestone 6 — Backup, settings, and PWA hardening

- Add settings and preference persistence.
- Implement versioned export/import with preview, validation, and atomic restore.
- Add service worker/PWA install support and offline behavior.
- Add reduced-motion and keyboard accessibility verification.

Checks:

- Import/export integration tests including malformed, unsupported, and partially invalid files.
- Playwright backup restore test.
- Offline browser test and production build verification.

## Milestone 7 — Release hardening

- Review empty, loading, error, and destructive-action states.
- Review responsive behavior and WCAG 2.2 AA concerns.
- Review data privacy and OWASP ASVS-relevant controls.
- Profile large history queries and migration behavior.
- Document known limitations, backup guidance, and release procedure.

Exit criteria:

- All Definition of Done requirements are met.
- Checks are run and reported with real results.
- No critical feature remains a mock or placeholder.

## Working rules between milestones

1. Implement only the current milestone’s scope unless a dependency requires otherwise.
2. Run the smallest relevant checks after each meaningful change.
3. Fix failures before starting the next milestone.
4. Preserve working behavior and use migrations for persisted changes.
5. Summarize changed files, checks run, failures fixed, and the next milestone.
6. Never state that a check passed unless the command actually ran successfully.
