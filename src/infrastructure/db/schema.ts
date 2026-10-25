import type { Transaction } from 'dexie'
import type { RecurrenceSchedule, TrackerField } from '../../domain/tracker/types'
import type { ActivityValue } from '../../domain/activity/types'

export const DATABASE_NAME = 'solo-system'
export const DATABASE_VERSION = 2

export type EntityMetaRecord = {
  id: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
}

export type UserSettingsRecord = EntityMetaRecord & {
  timeZone: string
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  theme: 'system' | 'light' | 'dark'
  density: 'comfortable' | 'compact'
  reducedMotion: 'system' | 'always' | 'never'
  defaultCalendarView: 'day' | 'week' | 'month' | 'year'
}

export type CategoryRecord = EntityMetaRecord & {
  name: string
  description?: string
  status: 'active' | 'archived'
}

export type TrackerDefinitionRecord = EntityMetaRecord & {
  name: string
  description?: string
  categoryId?: string
  iconKey: string
  colorToken: string
  field: TrackerField
  recurrence: RecurrenceSchedule
  target?: number
  targetUnit?: string
  notesEnabled: boolean
  status: 'active' | 'archived'
}

export type ActivityRecord = EntityMetaRecord & {
  trackerId: string
  occurredAt: string
  localDate: string
  value: ActivityValue
  note?: string
  logicalOccurrenceKey: string
  source: 'manual' | 'imported' | 'system'
  correctionOfActivityId?: string
  status: 'active' | 'voided'
}

export const tableNames = {
  settings: 'settings',
  categories: 'categories',
  trackers: 'trackers',
  activities: 'activities'
} as const

type SchemaVersion = {
  version: number
  stores: Record<string, string>
  upgrade?: (transaction: Transaction) => Promise<void>
}

const upgradeToV2 = async (transaction: Transaction) => {
  const trackers = transaction.table<TrackerDefinitionRecord, string>(tableNames.trackers)
  const activities = transaction.table<ActivityRecord, string>(tableNames.activities)

  await trackers.toCollection().modify((tracker) => {
    tracker.schemaVersion = 2
    tracker.description ??= undefined
    tracker.categoryId ??= undefined
    tracker.iconKey ??= 'tracker-default'
    tracker.colorToken ??= 'indigo'
    tracker.field ??= {
      key: 'value',
      label: 'Value',
      type: 'boolean',
      required: true
    }
    tracker.recurrence ??= { kind: 'daily' }
    tracker.target ??= undefined
    tracker.targetUnit ??= undefined
    tracker.notesEnabled ??= true
  })

  await activities.toCollection().modify((activity) => {
    activity.schemaVersion = 2
    activity.value ??= { type: 'boolean', value: true }
    activity.note ??= undefined
    activity.source ??= 'manual'
    activity.correctionOfActivityId ??= undefined
  })
}

export const schemaByVersion: ReadonlyArray<SchemaVersion> = [
  {
    version: 1,
    stores: {
      [tableNames.settings]: '&id, updatedAt',
      [tableNames.trackers]: '&id, status, updatedAt',
      [tableNames.activities]: '&id, trackerId, occurredAt, [trackerId+localDate], logicalOccurrenceKey, status, updatedAt'
    }
  },
  {
    version: DATABASE_VERSION,
    stores: {
      [tableNames.settings]: '&id, updatedAt',
      [tableNames.categories]: '&id, name, status, updatedAt',
      [tableNames.trackers]: '&id, categoryId, status, updatedAt, [categoryId+status]',
      [tableNames.activities]: '&id, trackerId, occurredAt, [trackerId+localDate], logicalOccurrenceKey, status, updatedAt'
    },
    upgrade: upgradeToV2
  }
]
