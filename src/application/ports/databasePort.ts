export type DatabasePort = {
  open: () => PromiseLike<unknown>
  close: () => void
  schemaVersion: number
}
