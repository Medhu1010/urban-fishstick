export type Clock = {
  now: () => Date
}

export type IdProvider = {
  nextId: () => string
}
