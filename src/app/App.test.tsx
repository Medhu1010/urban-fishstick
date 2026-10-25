import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { AppRoutes } from './routes'
import { renderWithRouter } from '../test/helpers/testingProviders'

describe('App shell', () => {
  it('renders navigation and dashboard placeholder', () => {
    renderWithRouter(<AppRoutes />)

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Solo System' })).toBeInTheDocument()
    expect(screen.getByText('Dashboard is in early foundation state')).toBeInTheDocument()
  })

  it('renders trackers route heading', async () => {
    renderWithRouter(<AppRoutes />, { initialEntries: ['/trackers'] })

    expect(await screen.findByRole('heading', { level: 2, name: 'Trackers' })).toBeInTheDocument()
  })
})
