import type { EntityMeta } from '../common/types'

export type ActivityValue =
  | { type: 'boolean'; value: boolean }
  | { type: 'number'; value: number }
  | { type: 'duration'; seconds: number }
  | { type: 'counter'; value: number }
  | { type: 'rating'; value: number }
  | { type: 'text'; value: string }

export type ActivityRecord = EntityMeta & {
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

export type RecordActivityInput = {
  trackerId: string
  occurredAt?: string
  value: ActivityValue
  note?: string
  timeZone: string
}

export type UpdateActivityInput = {
  activityId: string
  value: ActivityValue
  note?: string
}
