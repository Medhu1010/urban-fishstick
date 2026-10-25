import { Outlet } from 'react-router-dom'
import { AppNavLink } from '../../components/ui/AppNavLink'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/trackers', label: 'Trackers' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/goals', label: 'Goals' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' }
] as const

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <header className="mb-4 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight">Solo System</h1>
            <p className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">Local-first life progression tracker</p>
          </div>
          <nav aria-label="Primary">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {navItems.map((item) => (
                <li key={item.to}>
                  <AppNavLink to={item.to}>{item.label}</AppNavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="pb-6">
        <Outlet />
      </main>
    </div>
  )
}
