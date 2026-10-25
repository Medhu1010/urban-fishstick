import type { EntityMeta, EntityStatus } from '../common/types'

export type TrackerFieldType = 'boolean' | 'number' | 'duration' | 'counter' | 'rating' | 'text'

export type TrackerField = {
  key: string
  label: string
  type: TrackerFieldType
  required: boolean
  unit?: string
  min?: number
  max?: number
  step?: number
}

export type RecurrenceSchedule =
  | { kind: 'daily' }
  | { kind: 'weekly'; weekdays: number[] }
  | { kind: 'monthly'; days: number[] }
  | { kind: 'yearly'; month: number; day: number }
  | { kind: 'interval'; every: number; unit: 'day' | 'week' }

export type CategoryDefinition = EntityMeta & {
  name: string
  description?: string
  status: EntityStatus
}

export type TrackerDefinition = EntityMeta & {
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
  status: EntityStatus
}

export type CreateCategoryInput = {
  name: string
  description?: string
}

export type CreateTrackerInput = {
  name: string
  description?: string
  categoryId?: string
  field: TrackerField
  recurrence: RecurrenceSchedule
  target?: number
  targetUnit?: string
  notesEnabled: boolean
}
