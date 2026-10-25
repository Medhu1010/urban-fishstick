import type { Clock } from '../../application/ports/systemPorts'

export const systemClock: Clock = {
  now: () => new Date()
}
