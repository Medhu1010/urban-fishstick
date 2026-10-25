import type { TrackerRepository } from '../../application/ports/trackerRepository'
import type { ActivityRecord } from '../../domain/activity/types'
import type { CategoryDefinition, TrackerDefinition } from '../../domain/tracker/types'
import type { SoloDatabase } from '../db/soloDatabase'

export class DexieTrackerRepository implements TrackerRepository {
  public constructor(private readonly db: SoloDatabase) {}

  public async listCategories() {
    return this.db.categories.where('status').equals('active').sortBy('name') as Promise<CategoryDefinition[]>
  }

  public async createCategory(category: CategoryDefinition) {
    await this.db.categories.put(category)
  }

  public async listTrackers() {
    return this.db.trackers.where('status').equals('active').sortBy('updatedAt') as Promise<TrackerDefinition[]>
  }

  public async getTrackerById(trackerId: string) {
    return this.db.trackers.get(trackerId) as Promise<TrackerDefinition | undefined>
  }

  public async createTracker(tracker: TrackerDefinition) {
    await this.db.trackers.put(tracker)
  }

  public async updateTracker(tracker: TrackerDefinition) {
    await this.db.trackers.put(tracker)
  }

  public async listActivitiesForTracker(trackerId: string) {
    const records = (await this.db.activities.where('trackerId').equals(trackerId).reverse().sortBy('occurredAt')) as ActivityRecord[]
    return records.reverse()
  }

  public async getActivityById(activityId: string) {
    return this.db.activities.get(activityId) as Promise<ActivityRecord | undefined>
  }

  public async getActivityByOccurrenceKey(logicalOccurrenceKey: string) {
    return this.db.activities.where('logicalOccurrenceKey').equals(logicalOccurrenceKey).first() as Promise<ActivityRecord | undefined>
  }

  public async createActivity(activity: ActivityRecord) {
    await this.db.activities.put(activity)
  }

  public async updateActivity(activity: ActivityRecord) {
    await this.db.activities.put(activity)
  }

  public async runInTransaction<T>(operation: () => Promise<T>) {
    return this.db.transaction('rw', this.db.trackers, this.db.activities, this.db.categories, operation)
  }
}
