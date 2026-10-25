import { systemClock } from '../clocks/systemClock'
import { cryptoIdProvider } from '../ids/cryptoIdProvider'
import { SoloDatabase } from './soloDatabase'

export const db = new SoloDatabase({
  clock: systemClock,
  idProvider: cryptoIdProvider
})
