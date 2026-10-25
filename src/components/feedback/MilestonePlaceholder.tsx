import { StatePanel } from './StatePanel'

type MilestonePlaceholderProps = {
  section: string
}

export function MilestonePlaceholder({ section }: MilestonePlaceholderProps) {
  return (
    <StatePanel
      tone="info"
      title={`${section} is in early foundation state`}
      message="This screen is intentionally scoped as a Milestone 1 placeholder. Feature logic will be implemented in later roadmap milestones."
    />
  )
}
