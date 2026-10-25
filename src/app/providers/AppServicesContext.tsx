import { createContext, useContext } from 'react'
import { trackerService } from '../../infrastructure/repositories'
import type { TrackerService } from '../../application/services/trackerService'

export type AppServices = {
  trackerService: TrackerService
}

export const defaultAppServices: AppServices = {
  trackerService
}

export const AppServicesContext = createContext<AppServices>(defaultAppServices)

export function useAppServices() {
  return useContext(AppServicesContext)
}
