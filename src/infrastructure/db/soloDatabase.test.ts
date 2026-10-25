import { describe, expect, it } from 'vitest'
import { SoloDatabase } from './soloDatabase'
import { DATABASE_VERSION, tableNames } from './schema'

const fixedDate = new Date('2026-01-01T00:00:00.000Z')

describe('SoloDatabase', () => {
  it('initializes schema with version 1 and expected tables', async () => {
    const db = new SoloDatabase({
      name: `solo-system-test-${crypto.randomUUID()}`,
      clock: { now: () => fixedDate },
      idProvider: { nextId: () => 'test-id' }
    })

    await db.open()

    expect(db.schemaVersion).toBe(DATABASE_VERSION)
    expect(db.tables.map((table) => table.name).sort()).toEqual(
      [tableNames.settings, tableNames.trackers, tableNames.activities].sort()
    )

    db.close()
    await db.delete()
  })
})
