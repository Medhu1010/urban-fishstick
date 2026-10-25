import { Card } from '../../components/ui/Card'
import { MilestonePlaceholder } from '../../components/feedback/MilestonePlaceholder'

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <Card title="Dashboard" description="Progress overview will be added incrementally.">
        <p className="text-sm text-[rgb(var(--color-text-muted))]">
          Solo System foundation is ready. Tracker activity, XP, and progression cards are intentionally pending Milestone 2+.
        </p>
      </Card>
      <MilestonePlaceholder section="Dashboard" />
    </div>
  )
}
