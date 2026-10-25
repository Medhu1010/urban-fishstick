import type { PropsWithChildren } from 'react'
import { AppServicesContext, defaultAppServices, type AppServices } from './AppServicesContext'

type AppProvidersProps = PropsWithChildren<{
  services?: AppServices
}>

export function AppProviders({ children, services }: AppProvidersProps) {
  return <AppServicesContext.Provider value={services ?? defaultAppServices}>{children}</AppServicesContext.Provider>
}
