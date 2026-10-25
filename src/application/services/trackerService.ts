import { AppError } from '../errors/appError'
import type { Clock, IdProvider } from '../ports/systemPorts'
import type { TrackerRepository } from '../ports/trackerRepository'
import type { ActivityRecord, ActivityValue, RecordActivityInput, UpdateActivityInput } from '../../domain/activity/types'
import type { CategoryDefinition, CreateCategoryInput, CreateTrackerInput, TrackerDefinition } from '../../domain/tracker/types'
import { validateActivityValueForField, validateRecurrence, validateTrackerField } from '../../domain/tracker/validation'

export type TrackerService = {
  listCategories: () => Promise<CategoryDefinition[]>
  createCategory: (input: CreateCategoryInput) => Promise<CategoryDefinition>
  listTrackers: () => Promise<TrackerDefinition[]>
  createTracker: (input: CreateTrackerInput) => Promise<TrackerDefinition>
  recordActivity: (input: RecordActivityInput) => Promise<ActivityRecord>
  listActivitiesForTracker: (trackerId: string) => Promise<ActivityRecord[]>
  updateActivity: (input: UpdateActivityInput) => Promise<ActivityRecord>
  voidActivity: (activityId: string) => Promise<ActivityRecord>
}

const CURRENT_SCHEMA_VERSION = 2

const toIso = (date: Date) => date.toISOString()

const toLocalDate = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)

const normalizeNumericValueType = (fieldType: TrackerDefinition['field']['type'], value: ActivityValue): ActivityValue => {
  if (fieldType === 'counter' || fieldType === 'rating') {
    if (value.type === 'number') {
      return { type: fieldType, value: value.value }
    }
  }

  return value
}

export class SoloTrackerService implements TrackerService {
  public constructor(
    private readonly repository: TrackerRepository,
    private readonly clock: Clock,
    private readonly idProvider: IdProvider
  ) {}

  public async listCategories() {
    return this.repository.listCategories()
  }

  public async createCategory(input: CreateCategoryInput) {
    const trimmedName = input.name.trim()

    if (trimmedName.length === 0) {
      throw new AppError('validation_error', 'Category name is required.')
    }

    const now = this.clock.now()
    const category: CategoryDefinition = {
      id: this.idProvider.nextId(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: toIso(now),
      updatedAt: toIso(now),
      name: trimmedName,
      description: input.description?.trim() || undefined,
      status: 'active'
    }

    await this.repository.createCategory(category)

    return category
  }

  public async listTrackers() {
    return this.repository.listTrackers()
  }

  public async createTracker(input: CreateTrackerInput) {
    const errors: string[] = []

    if (input.name.trim().length === 0) {
      errors.push('Tracker name is required.')
    }

    const fieldValidation = validateTrackerField(input.field)
    if (!fieldValidation.ok) {
      errors.push(...fieldValidation.errors)
    }

    const recurrenceValidation = validateRecurrence(input.recurrence)
    if (!recurrenceValidation.ok) {
      errors.push(...recurrenceValidation.errors)
    }

    if (errors.length > 0) {
      throw new AppError('validation_error', 'Tracker definition is invalid.', errors)
    }

    const now = this.clock.now()

    const tracker: TrackerDefinition = {
      id: this.idProvider.nextId(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: toIso(now),
      updatedAt: toIso(now),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      categoryId: input.categoryId,
      iconKey: 'tracker-default',
      colorToken: 'indigo',
      field: input.field,
      recurrence: input.recurrence,
      target: input.target,
      targetUnit: input.targetUnit,
      notesEnabled: input.notesEnabled,
      status: 'active'
    }

    await this.repository.createTracker(tracker)

    return tracker
  }

  public async listActivitiesForTracker(trackerId: string) {
    return this.repository.listActivitiesForTracker(trackerId)
  }

  public async recordActivity(input: RecordActivityInput) {
    const tracker = await this.repository.getTrackerById(input.trackerId)
    if (!tracker) {
      throw new AppError('not_found', 'Tracker not found.')
    }

    const normalizedValue = normalizeNumericValueType(tracker.field.type, input.value)
    const validation = validateActivityValueForField(tracker.field, normalizedValue)
    if (!validation.ok) {
      throw new AppError('validation_error', 'Activity value is invalid.', validation.errors)
    }

    const occurredDate = input.occurredAt ? new Date(input.occurredAt) : this.clock.now()
    if (Number.isNaN(occurredDate.getTime())) {
      throw new AppError('validation_error', 'Activity time is invalid.')
    }

    const occurredAt = toIso(occurredDate)
    const localDate = toLocalDate(occurredDate, input.timeZone)
    const logicalOccurrenceKey = `${input.trackerId}:${localDate}`

    const existing = await this.repository.getActivityByOccurrenceKey(logicalOccurrenceKey)
    if (existing && existing.status === 'active') {
      throw new AppError('conflict', 'An activity already exists for this tracker occurrence.')
    }

    const now = this.clock.now()
    const activity: ActivityRecord = {
      id: this.idProvider.nextId(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: toIso(now),
      updatedAt: toIso(now),
      trackerId: tracker.id,
      occurredAt,
      localDate,
      value: normalizedValue,
      note: input.note?.trim() || undefined,
      logicalOccurrenceKey,
      source: 'manual',
      status: 'active'
    }

    await this.repository.runInTransaction(async () => {
      await this.repository.createActivity(activity)
    })

    return activity
  }

  public async updateActivity(input: UpdateActivityInput) {
    const existing = await this.repository.getActivityById(input.activityId)
    if (!existing || existing.status !== 'active') {
      throw new AppError('not_found', 'Activity not found.')
    }

    const tracker = await this.repository.getTrackerById(existing.trackerId)
    if (!tracker) {
      throw new AppError('not_found', 'Associated tracker not found.')
    }

    const normalizedValue = normalizeNumericValueType(tracker.field.type, input.value)
    const validation = validateActivityValueForField(tracker.field, normalizedValue)
    if (!validation.ok) {
      throw new AppError('validation_error', 'Updated activity value is invalid.', validation.errors)
    }

    const updated: ActivityRecord = {
      ...existing,
      value: normalizedValue,
      note: input.note?.trim() || undefined,
      updatedAt: toIso(this.clock.now())
    }

    await this.repository.runInTransaction(async () => {
      await this.repository.updateActivity(updated)
    })

    return updated
  }

  public async voidActivity(activityId: string) {
    const existing = await this.repository.getActivityById(activityId)
    if (!existing || existing.status !== 'active') {
      throw new AppError('not_found', 'Activity not found.')
    }

    const updated: ActivityRecord = {
      ...existing,
      status: 'voided',
      updatedAt: toIso(this.clock.now())
    }

    await this.repository.runInTransaction(async () => {
      await this.repository.updateActivity(updated)
    })

    return updated
  }
}
