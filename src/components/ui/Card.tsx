import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  title?: string
  description?: string
}>;

export function Card({ title, description, children }: CardProps) {
  return (
    <section className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-[var(--shadow-card)]">
      {title ? <h2 className="m-0 text-lg font-semibold">{title}</h2> : null}
      {description ? <p className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">{description}</p> : null}
      <div className={title || description ? 'mt-4' : undefined}>{children}</div>
    </section>
  )
}
