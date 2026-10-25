export type AppErrorCode = 'validation_error' | 'not_found' | 'conflict' | 'persistence_error'

export class AppError extends Error {
  public readonly code: AppErrorCode
  public readonly details?: string[]

  public constructor(code: AppErrorCode, message: string, details?: string[]) {
    super(message)
    this.code = code
    this.details = details
  }
}
