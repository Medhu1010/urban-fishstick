# Copilot Instructions for Solo System

## Project context

Solo System is a local-first, single-user personal life progression tracker. It is an original project inspired by RPG progression mechanics, not a clone of an existing anime application. Do not add copyrighted anime artwork, character names, logos, or unlicensed assets.

## Engineering priorities

1. Protect user data and make persistence failures visible.
2. Keep domain calculations deterministic and independently testable.
3. Preserve the separation between presentation, application services, domain logic, and persistence.
4. Prefer configuration and validated definitions over hardcoded tracker names, categories, attributes, or rewards.
5. Keep the initial product offline-capable and backend-free.
6. Build accessible, responsive UI with keyboard support, visible focus, semantic controls, clear validation, sufficient contrast, and reduced-motion support.

## Repository conventions

- TypeScript must remain in strict mode.
- Use stable IDs, explicit timestamps, schema versions, and migrations.
- Store tracker definitions separately from activity records.
- Treat activity values, derived analytics, progression state, and the XP ledger as separate concepts.
- Use Dexie transactions for mutations that update multiple records.
- Do not access Dexie directly from React components.
- Do not put the entire application in one component or file.
- Do not add backend infrastructure or telemetry unless explicitly requested.
- Do not silently discard data or report a failed save as successful.

## Domain rules

- Centralize XP, level, rank, achievement, quest, milestone, and streak calculations in pure domain modules.
- Make completion and XP awarding idempotent.
- Maintain an auditable XP ledger.
- Historical corrections use reversal/correction entries or a documented rebuild; never silently rewrite history.
- Calculate streaks from the tracker’s recurrence schedule, not a universal daily assumption.
- Use an injectable clock and explicit user time zone for recurrence and date calculations.
- Validate all external and persisted input at boundaries with runtime schemas.

## Testing requirements

For each feature, add the narrowest useful tests first:

- Domain unit tests for rules and edge cases.
- IndexedDB integration tests for persistence, transactions, migrations, and backup behavior.
- Component tests for validation, errors, keyboard interaction, and important states.
- Playwright tests for critical user journeys.

Before claiming work is complete, run and report the actual results of:

- Typecheck.
- Lint.
- Unit/integration tests.
- End-to-end tests when the relevant environment is available.
- Production build.

Never claim an unrun test passed. If a test cannot run, state why and what remains unverified.

## UI and accessibility

- Use semantic HTML and labels associated with controls.
- Keep keyboard focus visible and logical.
- Do not communicate important state through color alone.
- Provide loading, empty, success, validation, and failure states.
- Respect `prefers-reduced-motion` and the user’s in-app motion preference.
- Prefer accessible tables or text summaries alongside charts.
- Avoid excessive animation, inaccessible custom controls, and unexplained icon-only buttons.

## Data and security

- Treat imports as untrusted input and validate them before writes.
- Render imported text as text, never as HTML.
- Bound import sizes and reject unsupported backup versions safely.
- Keep personal data out of logs and URLs where possible.
- Do not add analytics, telemetry, or external transfers without explicit consent.
- Destructive reset flows require confirmation and should recommend an export first.

## Change workflow

- Work one roadmap milestone at a time.
- Inspect existing functionality before changing it.
- Avoid replacing working functionality unnecessarily.
- Update documentation when architecture, data contracts, or user-visible behavior changes.
- For schema changes, add a migration and tests before relying on the new shape.
- At the end of a milestone, summarize changes, checks run, failures fixed, and the next milestone.

## Product decisions that should not be revisited casually

- The app starts without a backend.
- Dexie is the initial persistence implementation.
- Progression calculations are explainable and auditable.
- Tracker configuration is data-driven.
- Local-first privacy is the default.
- Original visual assets and terminology are required.

Ask for clarification only when a decision materially affects data integrity, backup compatibility, or a core user journey and cannot be resolved from the product specification.
