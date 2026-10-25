import type { ActivityValue } from '../activity/types'
import type { RecurrenceSchedule, TrackerField, TrackerFieldType } from './types'

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] }

const ensure = (condition: boolean, message: string, errors: string[]) => {
  if (!condition) {
    errors.push(message)
  }
}

export function validateRecurrence(schedule: RecurrenceSchedule): ValidationResult {
  const errors: string[] = []

  if (schedule.kind === 'weekly') {
    ensure(schedule.weekdays.length > 0, 'Select at least one weekday for weekly recurrence.', errors)
    ensure(schedule.weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6), 'Weekdays must be between 0 and 6.', errors)
  }

  if (schedule.kind === 'monthly') {
    ensure(schedule.days.length > 0, 'Select at least one day for monthly recurrence.', errors)
    ensure(schedule.days.every((day) => Number.isInteger(day) && day >= 1 && day <= 31), 'Monthly days must be between 1 and 31.', errors)
  }

  if (schedule.kind === 'yearly') {
    ensure(schedule.month >= 1 && schedule.month <= 12, 'Yearly month must be between 1 and 12.', errors)
    ensure(schedule.day >= 1 && schedule.day <= 31, 'Yearly day must be between 1 and 31.', errors)
  }

  if (schedule.kind === 'interval') {
    ensure(Number.isInteger(schedule.every) && schedule.every > 0, 'Interval frequency must be a positive integer.', errors)
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors }
}

export function validateTrackerField(field: TrackerField): ValidationResult {
  const errors: string[] = []

  ensure(field.key.trim().length > 0, 'Field key is required.', errors)
  ensure(field.label.trim().length > 0, 'Field label is required.', errors)

  if (field.type !== 'boolean' && field.type !== 'text') {
    if (field.min !== undefined && field.max !== undefined) {
      ensure(field.min <= field.max, 'Field minimum cannot be greater than maximum.', errors)
    }

    if (field.step !== undefined) {
      ensure(field.step > 0, 'Field step must be greater than zero.', errors)
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors }
}

const checkNumericRange = (value: number, field: TrackerField, errors: string[]) => {
  ensure(Number.isFinite(value), 'Value must be numeric.', errors)
  if (field.min !== undefined) {
    ensure(value >= field.min, `Value must be at least ${field.min}.`, errors)
  }

  if (field.max !== undefined) {
    ensure(value <= field.max, `Value must be at most ${field.max}.`, errors)
  }
}

const checkByFieldType = (fieldType: TrackerFieldType, value: ActivityValue, field: TrackerField, errors: string[]) => {
  if (fieldType === 'boolean') {
    ensure(value.type === 'boolean', 'Expected a boolean activity value.', errors)
    return
  }

  if (fieldType === 'text') {
    ensure(value.type === 'text', 'Expected a text activity value.', errors)
    if (value.type === 'text' && field.required) {
      ensure(value.value.trim().length > 0, 'Text value is required.', errors)
    }
    return
  }

  if (fieldType === 'duration') {
    ensure(value.type === 'duration', 'Expected a duration activity value.', errors)
    if (value.type === 'duration') {
      checkNumericRange(value.seconds, field, errors)
      ensure(value.seconds >= 0, 'Duration must be non-negative.', errors)
    }
    return
  }

  const expectedType = fieldType === 'number' || fieldType === 'counter' || fieldType === 'rating'
  ensure(expectedType && (value.type === fieldType || (fieldType !== 'number' && value.type === 'number')), `Expected a ${fieldType} activity value.`, errors)

  if ('value' in value && typeof value.value === 'number') {
    checkNumericRange(value.value, field, errors)
    if (fieldType === 'counter') {
      ensure(Number.isInteger(value.value), 'Counter values must be integers.', errors)
    }
  }
}

export function validateActivityValueForField(field: TrackerField, value: ActivityValue): ValidationResult {
  const errors: string[] = []
  checkByFieldType(field.type, value, field, errors)
  return errors.length === 0 ? { ok: true } : { ok: false, errors }
}
