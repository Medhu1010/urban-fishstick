import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'

export function renderWithRouter(children: PropsWithChildren['children'], initialEntries: string[] = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>)
}
