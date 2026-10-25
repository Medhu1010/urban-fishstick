import Dexie, { type EntityTable } from 'dexie'
import type { Clock, IdProvider } from '../../application/ports/systemPorts'
import type { DatabasePort } from '../../application/ports/databasePort'
import {
  DATABASE_NAME,
  schemaByVersion,
  tableNames,
  type ActivityRecord,
  type CategoryRecord,
  type TrackerDefinitionRecord,
  type UserSettingsRecord
} from './schema'

export type DatabaseDependencies = {
  clock: Clock
  idProvider: IdProvider
  name?: string
}

export class SoloDatabase extends Dexie implements DatabasePort {
  public readonly settings!: EntityTable<UserSettingsRecord, 'id'>
  public readonly categories!: EntityTable<CategoryRecord, 'id'>
  public readonly trackers!: EntityTable<TrackerDefinitionRecord, 'id'>
  public readonly activities!: EntityTable<ActivityRecord, 'id'>

  public readonly clock: Clock
  public readonly idProvider: IdProvider

  public constructor({ clock, idProvider, name = DATABASE_NAME }: DatabaseDependencies) {
    super(name)
    this.clock = clock
    this.idProvider = idProvider

    for (const schema of schemaByVersion) {
      const definition = this.version(schema.version).stores(schema.stores)
      if (schema.upgrade) {
        definition.upgrade(schema.upgrade)
      }
    }

    this.settings = this.table(tableNames.settings)
    this.categories = this.table(tableNames.categories)
    this.trackers = this.table(tableNames.trackers)
    this.activities = this.table(tableNames.activities)
  }

  public get schemaVersion() {
    return this.verno
  }
}
