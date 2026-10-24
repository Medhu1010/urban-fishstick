# Solo System Architecture

## 1. Architectural goals

Solo System uses a layered, local-first architecture that keeps the UI replaceable, domain calculations pure, and persistence abstract. The initial implementation is a browser-only React application using Dexie over IndexedDB. A future backend must be addable behind repository and synchronization interfaces without rewriting domain rules or presentation components.

## 2. Technology baseline

- React and TypeScript in strict mode.
- Vite for development and production bundling.
- Tailwind CSS for tokens and layout utilities.
- Accessible reusable components implemented in the application codebase.
- Dexie for IndexedDB persistence and transactions.
- Zod or an equivalent runtime validator at import, form, and persistence boundaries.
- Vitest for unit and integration tests.
- Playwright for browser-level end-to-end tests.
- A small charting library only where it reduces maintenance; custom SVG is preferred for simple progress visuals.
- Vite PWA support for installability and offline caching.

Dependency versions must be selected together from compatible stable releases and recorded in `package.json` and the project README when implementation begins. Avoid adding a dependency for a small utility that can be implemented and tested locally.

## 3. Layers

### Presentation

React routes, pages, components, hooks, view models, form state, accessibility behavior, and error rendering. Presentation code may call application use cases but must not contain XP, streak, recurrence, or database transaction rules.

### Application

Use cases orchestrate user intent and boundaries:

- Create/update/archive tracker.
- Record, edit, and delete activity.
- Recalculate or inspect progression.
- Create and update goals/projects.
- Query calendar and analytics read models.
- Export and import backups.
- Update settings.

Use cases coordinate repositories and domain services, returning typed results suitable for UI state.

### Domain

Pure, framework-independent types and functions:

- Tracker definitions and field schemas.
- Recurrence schedules and occurrence evaluation.
- Activity validation and normalization.
- XP rule evaluation and ledger commands.
- Level, rank, achievement, milestone, and streak calculations.
- Goal progress calculations.
- Import/export envelope validation rules that do not depend on browser APIs.

The domain must be deterministic for the same input, rule version, and time context.

### Infrastructure

Dexie database schema, migrations, repository implementations, transaction adapters, UUID/time providers, JSON serialization, PWA registration, and future backend adapters. Infrastructure maps stored records to domain models and must not leak IndexedDB details upward.

## 4. Recommended folder structure

```text
src/
  app/
    App.tsx
    routes.tsx
    providers/
    queryKeys.ts
  components/
    ui/
    feedback/
    charts/
  features/
    dashboard/
    trackers/
    activities/
    calendar/
    progression/
    goals/
    analytics/
    settings/
    backup/
  application/
    commands/
    queries/
    ports/
    dto/
  domain/
    common/
    tracker/
    activity/
    recurrence/
    progression/
    goals/
    analytics/
    backup/
  infrastructure/
    db/
    repositories/
    clocks/
    ids/
    serialization/
    pwa/
  styles/
    tokens.css
    globals.css
  test/
    factories/
    setup.ts
    helpers/
public/
docs/
  PRODUCT_SPEC.md
  ARCHITECTURE.md
  DATA_MODEL.md
  ROADMAP.md
.github/
  copilot-instructions.md
```

The exact structure can evolve, but presentation, application, domain, and infrastructure responsibilities must remain recognizable.

## 5. Dependency direction

- `components` and feature UI may depend on `application` DTOs and shared UI utilities.
- `application` may depend on `domain` and declared repository ports.
- `domain` depends only on standard TypeScript/runtime-safe utilities.
- `infrastructure` implements application ports and may depend on domain serialization helpers.
- `domain` must never import React, Dexie, browser storage, or charting code.
- Feature pages should not access Dexie directly.

## 6. Persistence strategy

Use a single Dexie database with explicit schema versions and separate tables for definitions, event records, derived state, and audit records. All multi-record mutations use Dexie transactions through repository methods or an infrastructure transaction boundary.

The database should support:

- Migration functions for every schema change.
- Stable IDs generated at the application boundary.
- Explicit timestamps from an injectable clock.
- Soft deletion/archive where history depends on the record.
- Indexed fields for user/date, tracker/date, and source references.
- Transactional import replacement and restore.

Derived analytics may be recomputed from source activities. Cached read models are allowed only when invalidation/rebuild behavior is explicit.

## 7. Command and query separation

Commands mutate state and return a result containing affected IDs, progression changes, warnings, and errors. Queries return read-only projections optimized for screens. A command such as `recordActivity` should:

1. Validate the tracker and activity value.
2. Normalize the event timestamp and logical occurrence key.
3. Check idempotency and existing event state.
4. Persist the activity.
5. Evaluate progression rules.
6. Write XP ledger entries and progression snapshots atomically.
7. Return a summary for immediate UI feedback.

## 8. Idempotency and correction policy

Each mutation that can award XP receives an idempotency key derived from the logical source event and rule version. The ledger enforces uniqueness for an award key. Repeating a command returns the existing result rather than awarding XP again.

Historical edits do not delete evidence of prior awards. The application writes a reversal/correction entry linked to the original ledger item and then writes any replacement award. Current progression is derived from the effective ledger balance or a controlled rebuild. The UI must explain the impact before confirmation.

## 9. Time and recurrence

Use an injectable clock and explicit time zone in application services. Store instants as ISO timestamps and store user-facing calendar dates separately where needed. Recurrence evaluation accepts:

- Schedule definition.
- User time zone.
- Candidate date/time.
- Reference date.

Avoid using the browser’s local time implicitly in domain code. Test daylight-saving transitions, month boundaries, leap years, and schedules with skipped days.

## 10. Security and privacy

- No telemetry, analytics, or remote data transfer by default.
- Validate all imported JSON before constructing domain records.
- Treat imported text as untrusted content; render it as text, never as HTML.
- Use safe file handling and size limits for imports.
- Avoid putting private activity data in URLs, logs, or error telemetry.
- Use Content Security Policy-compatible code and avoid unnecessary dynamic execution.
- Make destructive actions explicit and recoverable through export/backup flows.
- Follow applicable WCAG 2.2 AA practices and relevant OWASP ASVS browser-application controls.

## 11. Error handling

Represent expected failures as typed application errors with stable codes, user-safe messages, and optional diagnostic details. Distinguish validation errors, conflict/idempotency results, persistence failures, migration failures, and unexpected errors. A failed transaction must result in a visible failure state and no success toast.

## 12. Testing architecture

- Domain unit tests cover recurrence, target normalization, XP, levels, ranks, streaks, achievements, corrections, and idempotency.
- Repository integration tests use an isolated IndexedDB test database and exercise migrations, transactions, and import/export.
- Component tests cover validation, keyboard interactions, error states, and reduced motion where practical.
- Playwright covers the critical journeys in the product specification.
- Accessibility checks use semantic assertions and an automated accessibility scanner where compatible.
- Build verification includes typecheck, lint, unit/integration tests, E2E tests, and production build.

## 13. Future synchronization seam

Define repository ports around domain operations rather than Dexie APIs. A future sync adapter can implement pull/push of versioned records and conflict policies. Until synchronization exists, local records should still contain enough metadata for future reconciliation: stable IDs, timestamps, schema versions, source links, and correction relationships.
