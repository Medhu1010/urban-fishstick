import type { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../../app/providers/AppProviders'
import type { AppServices } from '../../app/providers/AppServicesContext'

type RenderWithRouterOptions = {
  initialEntries?: string[]
  services?: AppServices
}

export function renderWithRouter(children: PropsWithChildren['children'], options: RenderWithRouterOptions = {}) {
  return render(
    <AppProviders services={options.services}>
      <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>{children}</MemoryRouter>
    </AppProviders>
  )
}
