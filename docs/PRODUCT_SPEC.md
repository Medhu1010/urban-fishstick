# Solo System Product Specification

## 1. Product summary

Solo System is a local-first, single-user personal life progression tracker. It turns configurable real-world activities and measurements into an understandable progression loop: define trackers, record activity, review history, earn deterministic XP, complete quests, advance attributes, and inspect long-term trends.

The product is inspired by RPG progression mechanics, but all branding, visual assets, terminology, and interface composition must be original. No copyrighted anime artwork or unlicensed third-party assets are required.

## 2. Goals

- Give one person a fast, reliable way to record meaningful activities and measurements.
- Allow new trackers, categories, attributes, rewards, and custom fields to be created through configuration rather than source-code changes.
- Make progression explainable: every XP change has an auditable source and deterministic calculation.
- Work offline and preserve user data locally by default.
- Support historical correction without silently rewriting progression history.
- Provide useful insight into consistency, trends, goals, and personal records.
- Keep the domain and persistence layers ready for a future synchronized backend.

## 3. Non-goals for the MVP

- Multi-user accounts, sharing, social feeds, or multiplayer features.
- A backend, remote authentication, or automatic cloud synchronization.
- AI-generated coaching or medical, financial, or mental-health advice.
- A full task-management replacement.
- A marketplace for themes, quests, or assets.
- Real-money rewards or external data integrations.

## 4. Product principles

1. **User data is authoritative.** Failed writes are visible; no data is silently discarded.
2. **Configuration over code.** Domain behavior is driven by persisted definitions and validated rule data.
3. **Explainable progression.** XP, streaks, ranks, and achievements can be traced back to activity and rule versions.
4. **Local-first.** The application remains useful without network access and does not transmit data without explicit consent.
5. **Low-friction capture.** A common activity should take only a few interactions to record.
6. **Accessible by default.** Keyboard navigation, focus visibility, semantic controls, color contrast, reduced motion, and readable validation are required.
7. **Original visual identity.** Use an original system/status aesthetic rather than copied characters, artwork, names, or layouts.

## 5. MVP scope

### 5.1 Application shell and dashboard

- Responsive app shell with navigation for Dashboard, Trackers, Calendar, Goals, Analytics, and Settings.
- Dashboard cards for current level, rank, XP progress, attributes, daily quests, streaks, recent activity, and daily completion.
- Empty states that explain how to create the first tracker or record the first activity.
- Error states for failed persistence, invalid imports, and unavailable features.

### 5.2 Tracker builder

A user can create, edit, archive, and restore tracker definitions. MVP field types:

- Boolean: done/not done.
- Number: a numeric value with optional minimum, maximum, step, and unit.
- Duration: elapsed time stored in seconds with a display format.
- Counter: integer quantity, including increment/decrement capture.
- Rating: bounded integer or decimal scale.
- Text: optional journal-style value.

Tracker configuration includes:

- Name, description, icon key, color token, and category.
- Recurrence schedule: daily, selected weekdays, weekly, monthly, yearly, or custom interval.
- Target and unit where applicable.
- Notes and optional custom fields.
- Attribute mappings and XP rules.
- Active, archived, and deleted-safe lifecycle state.

### 5.3 Activity logging and history

- Record a value for a tracker on a selected date/time.
- Edit or delete an existing activity with confirmation and clear consequences.
- Show source activity, calculated contribution, and validation errors.
- Prevent duplicate completion/XP awards for the same logical activity event.
- Preserve timestamps and schema versions.

### 5.4 Progression

- Configurable attributes, such as Strength, Focus, Vitality, or user-defined alternatives.
- Deterministic XP calculation from tracker rules, target completion, streak bonuses, and configured caps.
- Level calculation from configurable thresholds.
- Rank bands based on level or total XP.
- Immutable or append-only XP ledger entries with reversal/correction entries rather than silent mutation.
- Basic achievements and milestones driven by persisted definitions.
- Daily quests generated from configured tracker or goal criteria.

### 5.5 Calendar and analytics

- Monthly calendar with activity indicators and detail view.
- Basic weekly and daily views where responsive layout permits.
- Contribution heatmap for the selected tracker or all trackers.
- Completion rate, current/longest streak, totals, trend line, and personal records.
- Date range and tracker/category filters.

### 5.6 Goals and projects

- Create goals with title, description, target, unit, deadline, and linked trackers.
- Optional projects containing milestones.
- Progress summaries based on activity, not manually duplicated values where possible.
- Overdue, completed, and active states.

### 5.7 Settings and data management

- Theme, density, reduced-motion preference, week-start preference, and time-zone display preference.
- Progression rule configuration with validation.
- JSON export containing a versioned backup envelope.
- Import preview, validation report, explicit confirmation, and transactional restore.
- Local data reset with multiple confirmations and an export recommendation.

## 6. Post-MVP scope

- Installable PWA enhancements and background sync preparation.
- Optional encrypted backup workflow chosen by the user.
- Backend adapter and cross-device synchronization.
- More recurrence expressions and calendar projections.
- Advanced custom fields and user-defined formulas.
- Saved analytics views and comparison periods.
- More expressive quest templates, reward types, and achievement conditions.
- Import adapters for common habit or task applications.

## 7. Core user journeys

### First-use journey

1. Open the app offline or online.
2. See an empty dashboard with a clear call to create a tracker.
3. Create a tracker such as “Read” with a daily recurrence and numeric target.
4. Record today’s value.
5. See the activity, XP ledger entry, updated level progress, and streak.
6. Return to the dashboard and calendar to verify the persisted state.

### Historical correction journey

1. Open Calendar or a tracker history view.
2. Select an existing activity and choose Edit.
3. Change the value/date or delete the event.
4. See a confirmation describing the progression impact.
5. Apply the correction in one transaction.
6. View the resulting correction/reversal entries in the XP ledger.

### Backup restoration journey

1. Export a backup file.
2. Select an import file.
3. Inspect version, record counts, validation warnings, and conflicts.
4. Confirm replacement or merge behavior explicitly.
5. Restore atomically or receive a visible error with no partial restore.

## 8. Domain decisions

- All persisted entities have stable IDs, `createdAt`, `updatedAt`, and a schema version.
- Dates are stored as ISO timestamps; recurrence and calendar calculations use an explicit user time zone.
- Activity values are stored separately from derived analytics and progression state.
- Tracker definitions are separate from activity logs so definitions can evolve without rewriting history.
- XP is calculated by pure domain services and recorded in a ledger.
- Historical edits create compensating ledger entries and new recalculated entries where needed.
- Streaks are evaluated against each tracker’s recurrence schedule; there is no universal daily streak rule.
- Archived definitions remain available for history and reporting.

## 9. Acceptance criteria for MVP

- A user can create every MVP tracker type without source-code changes.
- A valid activity can be saved and remains after reload and browser restart.
- An invalid activity is rejected with field-level feedback and no partial write.
- Repeating the same idempotent command does not award duplicate XP.
- Every XP ledger item identifies its source and rule version.
- Editing history does not silently alter the ledger.
- A tracker’s streak follows its recurrence schedule.
- Exported data can be validated and restored into an empty database.
- Import failure leaves the existing database unchanged.
- Core flows work without network access after the app is loaded.
- Typecheck, lint, unit tests, integration tests, E2E tests, and production build are run and their results are reported accurately.
- Keyboard-only navigation and reduced-motion behavior are covered by tests or documented manual verification.

## 10. Success measures

MVP success is qualitative and operational rather than telemetry-driven:

- Recording a routine activity feels quick and understandable.
- Users can explain why their XP changed.
- A backup can be restored confidently.
- No critical data-loss path is known.
- The codebase supports adding a new tracker field or reward rule through validated configuration and domain extensions, not scattered UI conditionals.
