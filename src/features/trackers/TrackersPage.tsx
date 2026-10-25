import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ActivityValue } from '../../domain/activity/types'
import type { CreateTrackerInput, RecurrenceSchedule, TrackerDefinition, TrackerFieldType } from '../../domain/tracker/types'
import { useAppServices } from '../../app/providers/AppServicesContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatePanel } from '../../components/feedback/StatePanel'

type WeekdayOption = {
  value: number
  label: string
}

const weekdays: WeekdayOption[] = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
]

const fieldTypeOptions: TrackerFieldType[] = ['boolean', 'number', 'duration', 'counter', 'rating', 'text']

type ActivityFormState = {
  booleanValue: boolean
  numericValue: string
  textValue: string
  note: string
}

const initialActivityState: ActivityFormState = {
  booleanValue: true,
  numericValue: '',
  textValue: '',
  note: ''
}

const formatActivityValue = (value: ActivityValue) => {
  switch (value.type) {
    case 'boolean':
      return value.value ? 'Completed' : 'Not completed'
    case 'duration':
      return `${value.seconds} seconds`
    case 'text':
      return value.value
    default:
      return `${value.value}`
  }
}

const parseActivityValue = (fieldType: TrackerFieldType, state: ActivityFormState): ActivityValue => {
  if (fieldType === 'boolean') {
    return { type: 'boolean', value: state.booleanValue }
  }

  if (fieldType === 'text') {
    return { type: 'text', value: state.textValue }
  }

  if (fieldType === 'duration') {
    return { type: 'duration', seconds: Number(state.numericValue) }
  }

  if (fieldType === 'number') {
    return { type: 'number', value: Number(state.numericValue) }
  }

  if (fieldType === 'counter') {
    return { type: 'counter', value: Number(state.numericValue) }
  }

  return { type: 'rating', value: Number(state.numericValue) }
}

export function TrackersPage() {
  const { trackerService } = useAppServices()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [categoryName, setCategoryName] = useState('General')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  const [trackerName, setTrackerName] = useState('')
  const [trackerDescription, setTrackerDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fieldType, setFieldType] = useState<TrackerFieldType>('boolean')
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit, setTargetUnit] = useState('')
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [recurrenceKind, setRecurrenceKind] = useState<'daily' | 'weekly'>('daily')

  const [trackers, setTrackers] = useState<TrackerDefinition[]>([])
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null)

  const [activities, setActivities] = useState<Array<{ id: string; occurredAt: string; status: 'active' | 'voided'; value: ActivityValue; note?: string }>>([])
  const [activityState, setActivityState] = useState<ActivityFormState>(initialActivityState)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)

  const selectedTracker = useMemo(
    () => trackers.find((tracker) => tracker.id === selectedTrackerId) ?? null,
    [selectedTrackerId, trackers]
  )

  const loadCategories = async () => {
    const categoryRecords = await trackerService.listCategories()
    setCategories(categoryRecords.map((category) => ({ id: category.id, name: category.name })))
  }

  const loadTrackers = async () => {
    const trackerRecords = await trackerService.listTrackers()
    const sorted = [...trackerRecords].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    setTrackers(sorted)

    if (!selectedTrackerId && sorted.length > 0) {
      setSelectedTrackerId(sorted[0].id)
    }
  }

  const loadActivities = async (trackerId: string) => {
    const activityRecords = await trackerService.listActivitiesForTracker(trackerId)
    setActivities(activityRecords)
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([loadCategories(), loadTrackers()])
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load trackers.')
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  useEffect(() => {
    if (!selectedTrackerId) {
      setActivities([])
      return
    }

    void loadActivities(selectedTrackerId)
  }, [selectedTrackerId])

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await trackerService.createCategory({ name: categoryName })
      await loadCategories()
      setCategoryName('')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create category.')
    }
  }

  const handleToggleWeekday = (day: number) => {
    setWeeklyDays((previous) =>
      previous.includes(day) ? previous.filter((current) => current !== day) : [...previous, day].sort((a, b) => a - b)
    )
  }

  const handleCreateTracker = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const recurrence: RecurrenceSchedule =
      recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: weeklyDays } : { kind: 'daily' }

    const payload: CreateTrackerInput = {
      name: trackerName,
      description: trackerDescription || undefined,
      categoryId: categoryId || undefined,
      field: {
        key: 'value',
        label: 'Value',
        type: fieldType,
        required: true,
        min: fieldType === 'number' || fieldType === 'counter' || fieldType === 'duration' || fieldType === 'rating' ? 0 : undefined,
        step: fieldType === 'counter' ? 1 : undefined
      },
      recurrence,
      target: targetValue ? Number(targetValue) : undefined,
      targetUnit: targetUnit || undefined,
      notesEnabled: true
    }

    try {
      const tracker = await trackerService.createTracker(payload)
      await loadTrackers()
      setSelectedTrackerId(tracker.id)
      setTrackerName('')
      setTrackerDescription('')
      setTargetValue('')
      setTargetUnit('')
      setFieldType('boolean')
      setWeeklyDays([1, 2, 3, 4, 5])
      setRecurrenceKind('daily')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create tracker.')
    }
  }

  const handleRecordActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!selectedTracker) {
      setError('Select a tracker before recording activity.')
      return
    }

    try {
      await trackerService.recordActivity({
        trackerId: selectedTracker.id,
        value: parseActivityValue(selectedTracker.field.type, activityState),
        note: activityState.note,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      })

      await loadActivities(selectedTracker.id)
      setActivityState(initialActivityState)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to record activity.')
    }
  }

  const handleEditActivity = async (activityId: string) => {
    if (!selectedTracker) {
      return
    }

    setError(null)

    try {
      await trackerService.updateActivity({
        activityId,
        value: parseActivityValue(selectedTracker.field.type, activityState),
        note: activityState.note
      })
      await loadActivities(selectedTracker.id)
      setEditingActivityId(null)
      setActivityState(initialActivityState)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update activity.')
    }
  }

  const handleVoidActivity = async (activityId: string) => {
    if (!selectedTracker) {
      return
    }

    setError(null)

    try {
      await trackerService.voidActivity(activityId)
      await loadActivities(selectedTracker.id)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to void activity.')
    }
  }

  if (isLoading) {
    return <StatePanel title="Trackers" tone="info" message="Loading tracker definitions and activity history..." />
  }

  return (
    <div className="space-y-4">
      <Card title="Tracker categories" description="Categories are configurable and stored locally.">
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Category name
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
              name="categoryName"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit">Create category</Button>
          </div>
        </form>
      </Card>

      <Card title="Create tracker" description="Define field type, recurrence, and optional target.">
        <form onSubmit={handleCreateTracker} className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Tracker name
            <input
              required
              value={trackerName}
              onChange={(event) => setTrackerName(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Description
            <input
              value={trackerDescription}
              onChange={(event) => setTrackerDescription(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Field type
            <select
              value={fieldType}
              onChange={(event) => setFieldType(event.target.value as TrackerFieldType)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            >
              {fieldTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Recurrence
            <select
              value={recurrenceKind}
              onChange={(event) => setRecurrenceKind(event.target.value as 'daily' | 'weekly')}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          {recurrenceKind === 'weekly' ? (
            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-sm font-medium">Weekly days</legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="inline-flex items-center gap-2 rounded-md border border-[rgb(var(--color-border))] px-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={weeklyDays.includes(day.value)}
                      onChange={() => handleToggleWeekday(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <label className="flex flex-col gap-1 text-sm">
            Target (optional)
            <input
              inputMode="decimal"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Target unit (optional)
            <input
              value={targetUnit}
              onChange={(event) => setTargetUnit(event.target.value)}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
            />
          </label>

          <div className="md:col-span-2">
            <Button type="submit">Save tracker</Button>
          </div>
        </form>
      </Card>

      {error ? <StatePanel title="Tracker action failed" tone="error" message={error} /> : null}

      <Card title="Trackers" description="Select a tracker to capture or edit activity values.">
        {trackers.length === 0 ? (
          <StatePanel
            title="No trackers yet"
            message="Create your first tracker above. Milestone 2 includes real persistence and validation for these records."
            tone="empty"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-[18rem,1fr]">
            <ul className="m-0 list-none space-y-2 p-0">
              {trackers.map((tracker) => (
                <li key={tracker.id}>
                  <button
                    type="button"
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      tracker.id === selectedTracker?.id
                        ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-surface-muted))]'
                        : 'border-[rgb(var(--color-border))]'
                    }`}
                    onClick={() => {
                      setSelectedTrackerId(tracker.id)
                      setEditingActivityId(null)
                    }}
                  >
                    <span className="block font-medium">{tracker.name}</span>
                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">{tracker.field.type}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              {selectedTracker ? (
                <>
                  <Card title={`Record activity for ${selectedTracker.name}`}>
                    <form onSubmit={handleRecordActivity} className="grid gap-3 md:grid-cols-2">
                      {selectedTracker.field.type === 'boolean' ? (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={activityState.booleanValue}
                            onChange={(event) =>
                              setActivityState((previous) => ({ ...previous, booleanValue: event.target.checked }))
                            }
                          />
                          Completed
                        </label>
                      ) : null}

                      {selectedTracker.field.type !== 'boolean' && selectedTracker.field.type !== 'text' ? (
                        <label className="flex flex-col gap-1 text-sm">
                          Value
                          <input
                            required
                            inputMode="decimal"
                            value={activityState.numericValue}
                            onChange={(event) =>
                              setActivityState((previous) => ({ ...previous, numericValue: event.target.value }))
                            }
                            className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
                          />
                        </label>
                      ) : null}

                      {selectedTracker.field.type === 'text' ? (
                        <label className="flex flex-col gap-1 text-sm md:col-span-2">
                          Entry
                          <textarea
                            required
                            value={activityState.textValue}
                            onChange={(event) => setActivityState((previous) => ({ ...previous, textValue: event.target.value }))}
                            className="min-h-[6rem] rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
                          />
                        </label>
                      ) : null}

                      <label className="flex flex-col gap-1 text-sm md:col-span-2">
                        Note (optional)
                        <input
                          value={activityState.note}
                          onChange={(event) => setActivityState((previous) => ({ ...previous, note: event.target.value }))}
                          className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
                        />
                      </label>

                      <div className="md:col-span-2">
                        <Button type="submit">Record activity</Button>
                      </div>
                    </form>
                  </Card>

                  <Card title="Activity history" description="Edit or void existing activity records.">
                    {activities.length === 0 ? (
                      <p className="text-sm text-[rgb(var(--color-text-muted))]">No activity recorded yet for this tracker.</p>
                    ) : (
                      <ul className="m-0 list-none space-y-2 p-0">
                        {activities.map((activity) => (
                          <li key={activity.id} className="rounded-md border border-[rgb(var(--color-border))] p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="m-0 text-sm font-medium">{formatActivityValue(activity.value)}</p>
                                <p className="m-0 text-xs text-[rgb(var(--color-text-muted))]">{new Date(activity.occurredAt).toLocaleString()}</p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setEditingActivityId(activity.id)
                                    setActivityState({
                                      booleanValue: activity.value.type === 'boolean' ? activity.value.value : true,
                                      numericValue:
                                        activity.value.type === 'duration'
                                          ? `${activity.value.seconds}`
                                          : 'value' in activity.value
                                            ? `${activity.value.value}`
                                            : '',
                                      textValue: activity.value.type === 'text' ? activity.value.value : '',
                                      note: activity.note ?? ''
                                    })
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button variant="secondary" onClick={() => void handleVoidActivity(activity.id)}>
                                  Void
                                </Button>
                              </div>
                            </div>

                            {activity.status === 'voided' ? (
                              <p className="mt-2 text-xs font-semibold text-[rgb(var(--color-text-muted))]">Voided</p>
                            ) : null}

                            {editingActivityId === activity.id ? (
                              <form
                                className="mt-3 grid gap-2"
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  void handleEditActivity(activity.id)
                                }}
                              >
                                {selectedTracker.field.type === 'boolean' ? (
                                  <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={activityState.booleanValue}
                                      onChange={(event) =>
                                        setActivityState((previous) => ({ ...previous, booleanValue: event.target.checked }))
                                      }
                                    />
                                    Completed
                                  </label>
                                ) : null}

                                {selectedTracker.field.type !== 'boolean' && selectedTracker.field.type !== 'text' ? (
                                  <label className="flex flex-col gap-1 text-sm">
                                    Value
                                    <input
                                      required
                                      inputMode="decimal"
                                      value={activityState.numericValue}
                                      onChange={(event) =>
                                        setActivityState((previous) => ({ ...previous, numericValue: event.target.value }))
                                      }
                                      className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
                                    />
                                  </label>
                                ) : null}

                                {selectedTracker.field.type === 'text' ? (
                                  <label className="flex flex-col gap-1 text-sm">
                                    Entry
                                    <textarea
                                      required
                                      value={activityState.textValue}
                                      onChange={(event) =>
                                        setActivityState((previous) => ({ ...previous, textValue: event.target.value }))
                                      }
                                      className="min-h-[5rem] rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2"
                                    />
                                  </label>
                                ) : null}

                                <div className="flex gap-2">
                                  <Button type="submit">Save edit</Button>
                                  <Button variant="secondary" onClick={() => setEditingActivityId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </>
              ) : (
                <StatePanel title="Select a tracker" message="Choose a tracker from the list to capture activity." tone="info" />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
