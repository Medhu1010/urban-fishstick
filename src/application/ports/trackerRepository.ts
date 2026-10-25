import type { ActivityRecord } from '../../domain/activity/types'
import type { CategoryDefinition, TrackerDefinition } from '../../domain/tracker/types'

export type TrackerRepository = {
  listCategories: () => Promise<CategoryDefinition[]>
  createCategory: (category: CategoryDefinition) => Promise<void>
  listTrackers: () => Promise<TrackerDefinition[]>
  getTrackerById: (trackerId: string) => Promise<TrackerDefinition | undefined>
  createTracker: (tracker: TrackerDefinition) => Promise<void>
  updateTracker: (tracker: TrackerDefinition) => Promise<void>
  listActivitiesForTracker: (trackerId: string) => Promise<ActivityRecord[]>
  getActivityById: (activityId: string) => Promise<ActivityRecord | undefined>
  getActivityByOccurrenceKey: (logicalOccurrenceKey: string) => Promise<ActivityRecord | undefined>
  createActivity: (activity: ActivityRecord) => Promise<void>
  updateActivity: (activity: ActivityRecord) => Promise<void>
  runInTransaction: <T>(operation: () => Promise<T>) => Promise<T>
}
