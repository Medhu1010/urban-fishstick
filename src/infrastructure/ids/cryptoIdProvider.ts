import type { IdProvider } from '../../application/ports/systemPorts'

const fallbackRandomId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const cryptoIdProvider: IdProvider = {
  nextId: () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }

    return fallbackRandomId()
  }
}
