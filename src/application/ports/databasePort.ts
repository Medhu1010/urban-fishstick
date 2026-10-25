export type DatabasePort = {
  open: () => Promise<void>
  close: () => void
  schemaVersion: number
}
