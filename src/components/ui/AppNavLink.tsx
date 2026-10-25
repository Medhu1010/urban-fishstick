import { NavLink } from 'react-router-dom'

type AppNavLinkProps = {
  to: string
  children: string
}

export function AppNavLink({ to, children }: AppNavLinkProps) {
  const isRoot = to === '/'

  return (
    <NavLink
      to={to}
      end={isRoot}
      className={({ isActive }) =>
        `reduced-motion-safe rounded-md px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-contrast))]'
            : 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-muted))] hover:text-[rgb(var(--color-text))]'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
