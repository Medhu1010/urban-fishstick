import { SoloTrackerService } from '../../application/services/trackerService'
import { db } from '../db'
import { DexieTrackerRepository } from './dexieTrackerRepository'

const trackerRepository = new DexieTrackerRepository(db)

export const trackerService = new SoloTrackerService(trackerRepository, db.clock, db.idProvider)
