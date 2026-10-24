# Solo System Data Model

## 1. Modeling principles

The data model separates user-authored definitions, recorded activity, derived analytics, and progression accounting. All records use stable string IDs, ISO timestamps, and an explicit `schemaVersion`. JSON backup format is versioned independently from the IndexedDB schema.

The examples below are TypeScript-shaped contracts. They describe the intended domain and may be refined during implementation without changing the core invariants.

## 2. Shared types

```ts
type Id = string;
type ISODateTime = string;
type LocalDate = string; // YYYY-MM-DD in the user's configured time zone

type EntityMeta = {
  id: Id;
  schemaVersion: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

IDs must be generated once and remain stable across edits, exports, and future synchronization.

## 3. Tracker definitions

```ts
type TrackerFieldType =
  | 'boolean'
  | 'number'
  | 'duration'
  | 'counter'
  | 'rating'
  | 'text';

type TrackerField = {
  key: string;
  label: string;
  type: TrackerFieldType;
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
};

type RecurrenceSchedule =
  | { kind: 'daily' }
  | { kind: 'weekly'; weekdays: number[] }
  | { kind: 'monthly'; days: number[] }
  | { kind: 'yearly'; month: number; day: number }
  | { kind: 'interval'; every: number; unit: 'day' | 'week' };

type TrackerDefinition = EntityMeta & {
  name: string;
  description?: string;
  categoryId?: Id;
  iconKey: string;
  colorToken: string;
  field: TrackerField;
  recurrence: RecurrenceSchedule;
  target?: number;
  targetUnit?: string;
  notesEnabled: boolean;
  attributeMappings: Array<{
    attributeId: Id;
    weight: number;
  }>;
  xpRuleId: Id;
  status: 'active' | 'archived';
};
```

Tracker definitions are not activity records. Archiving a tracker must preserve its historical events.

## 4. Categories and attributes

```ts
type CategoryDefinition = EntityMeta & {
  name: string;
  description?: string;
  iconKey: string;
  colorToken: string;
  status: 'active' | 'archived';
};

type AttributeDefinition = EntityMeta & {
  name: string;
  description?: string;
  iconKey: string;
  colorToken: string;
  sortOrder: number;
  status: 'active' | 'archived';
};
```

No application logic may depend on specific attribute or category names.

## 5. Activity records

```ts
type ActivityValue =
  | { type: 'boolean'; value: boolean }
  | { type: 'number'; value: number }
  | { type: 'duration'; seconds: number }
  | { type: 'counter'; value: number }
  | { type: 'rating'; value: number }
  | { type: 'text'; value: string };

type ActivityRecord = EntityMeta & {
  trackerId: Id;
  occurredAt: ISODateTime;
  localDate: LocalDate;
  value: ActivityValue;
  note?: string;
  logicalOccurrenceKey: string;
  source: 'manual' | 'imported' | 'system';
  correctionOfActivityId?: Id;
  status: 'active' | 'voided';
};
```

The logical occurrence key supports idempotent completion for recurring trackers. Multiple legitimate entries can be supported later with an explicit tracker policy rather than accidental duplicate behavior.

## 6. XP rules and ledger

```ts
type XpRule = EntityMeta & {
  name: string;
  baseXp: number;
  targetMultiplier?: number;
  streakBonuses?: Array<{ threshold: number; bonusXp: number }>;
  dailyCap?: number;
  attributeMultiplier?: number;
  status: 'active' | 'archived';
};

type XpLedgerEntry = EntityMeta & {
  userScope: 'local-user';
  amount: number;
  reason: 'activity' | 'achievement' | 'quest' | 'milestone' | 'correction' | 'manual-adjustment';
  sourceType?: 'activity' | 'achievement' | 'quest' | 'goal' | 'system';
  sourceId?: Id;
  ruleId?: Id;
  ruleVersion?: number;
  idempotencyKey?: string;
  reversesEntryId?: Id;
  metadata?: Record<string, string | number | boolean>;
};
```

Ledger entries should be append-only from the domain’s perspective. Corrections use negative or compensating entries linked to the original.

## 7. Progression state

```ts
type ProgressionConfig = EntityMeta & {
  levelThresholds: number[];
  ranks: Array<{ key: string; label: string; minimumLevel: number }>;
  status: 'active';
};

type ProgressionSnapshot = EntityMeta & {
  totalXp: number;
  level: number;
  rankKey: string;
  attributeValues: Record<Id, number>;
  calculatedAt: ISODateTime;
  basedOnLedgerVersion: number;
};
```

Snapshots are derived state. The ledger and definitions remain the source of truth for rebuilds.

## 8. Quests, achievements, and milestones

```ts
type QuestDefinition = EntityMeta & {
  name: string;
  description: string;
  criteria: unknown; // validated discriminated union in implementation
  rewardXp: number;
  recurrence?: RecurrenceSchedule;
  status: 'active' | 'archived';
};

type QuestInstance = EntityMeta & {
  questDefinitionId: Id;
  periodStart: LocalDate;
  periodEnd: LocalDate;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'expired';
  completedAt?: ISODateTime;
};

type AchievementDefinition = EntityMeta & {
  name: string;
  description: string;
  criteria: unknown;
  rewardXp: number;
  status: 'active' | 'archived';
};

type AchievementUnlock = EntityMeta & {
  achievementDefinitionId: Id;
  unlockedAt: ISODateTime;
  sourceActivityId?: Id;
  sourceGoalId?: Id;
};
```

Criteria must become explicit discriminated unions before implementation; `unknown` above marks a configuration boundary, not an excuse to skip validation.

## 9. Goals and projects

```ts
type Goal = EntityMeta & {
  title: string;
  description?: string;
  target: number;
  unit: string;
  deadline?: LocalDate;
  linkedTrackerIds: Id[];
  status: 'active' | 'completed' | 'cancelled';
};

type Project = EntityMeta & {
  title: string;
  description?: string;
  deadline?: LocalDate;
  status: 'active' | 'completed' | 'archived';
};

type ProjectMilestone = EntityMeta & {
  projectId: Id;
  title: string;
  target?: number;
  unit?: string;
  linkedGoalId?: Id;
  completedAt?: ISODateTime;
  status: 'open' | 'completed';
};
```

Goal progress should be derived from linked activity where a compatible aggregation exists. Manual adjustments must be explicit and auditable.

## 10. User settings

```ts
type UserSettings = EntityMeta & {
  timeZone: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  reducedMotion: 'system' | 'always' | 'never';
  defaultCalendarView: 'day' | 'week' | 'month' | 'year';
};
```

## 11. Backup envelope

```ts
type BackupEnvelope = {
  format: 'solo-system-backup';
  formatVersion: number;
  exportedAt: ISODateTime;
  applicationVersion: string;
  timeZone: string;
  records: {
    settings: UserSettings[];
    categories: CategoryDefinition[];
    attributes: AttributeDefinition[];
    trackers: TrackerDefinition[];
    fields: TrackerField[];
    xpRules: XpRule[];
    activities: ActivityRecord[];
    ledger: XpLedgerEntry[];
    progressionConfig: ProgressionConfig[];
    progressionSnapshots: ProgressionSnapshot[];
    quests: QuestDefinition[];
    questInstances: QuestInstance[];
    achievements: AchievementDefinition[];
    unlocks: AchievementUnlock[];
    goals: Goal[];
    projects: Project[];
    milestones: ProjectMilestone[];
  };
  checksum?: string;
};
```

Import must validate the envelope, record counts, references, types, dates, and supported versions before any write. Restore is transactional and must not leave a partially imported database.

## 12. Indexing and relationships

Important indexes include:

- `activities.trackerId + localDate`.
- `activities.occurredAt`.
- `activities.logicalOccurrenceKey`.
- `ledger.idempotencyKey` unique when present.
- `ledger.sourceType + sourceId`.
- `questInstances.periodStart + periodEnd`.
- `goals.status + deadline`.

Foreign-key-like references are validated in application/domain services because IndexedDB does not provide relational constraints.

## 13. Migration policy

Every persisted schema change increments the database version and includes a migration. Backup format migrations are separate pure functions. Unsupported future versions fail safely with an actionable error; they must never be silently downgraded.
