export const DATABASE_NAME = 'solo-system'
export const DATABASE_VERSION = 1

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

export type TrackerDefinitionRecord = EntityMetaRecord & {
  name: string
  status: 'active' | 'archived'
}

export type ActivityRecord = EntityMetaRecord & {
  trackerId: string
  occurredAt: string
  localDate: string
  logicalOccurrenceKey: string
  status: 'active' | 'voided'
}

export const tableNames = {
  settings: 'settings',
  trackers: 'trackers',
  activities: 'activities'
} as const

export const schemaByVersion: ReadonlyArray<{
  version: number
  stores: Record<string, string>
}> = [
  {
    version: DATABASE_VERSION,
    stores: {
      [tableNames.settings]: '&id, updatedAt',
      [tableNames.trackers]: '&id, status, updatedAt',
      [tableNames.activities]: '&id, trackerId, occurredAt, [trackerId+localDate], logicalOccurrenceKey, status, updatedAt'
    }
  }
]
