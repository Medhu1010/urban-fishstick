import { Card } from '../ui/Card'

type StatePanelTone = 'empty' | 'error' | 'info'

type StatePanelProps = {
  title: string
  message: string
  tone?: StatePanelTone
}

const toneClasses: Record<StatePanelTone, string> = {
  empty: 'border-[rgb(var(--color-border))]',
  error: 'border-red-500',
  info: 'border-[rgb(var(--color-accent))]'
}

export function StatePanel({ title, message, tone = 'empty' }: StatePanelProps) {
  return (
    <div role={tone === 'error' ? 'alert' : undefined} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
      <Card>
        <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
          <h3 className="m-0 text-base font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-muted))]">{message}</p>
        </div>
      </Card>
    </div>
  )
}
