export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export function createAIError(message: string, code?: string, retryable: boolean = false): AIError {
  return new AIError(message, code, retryable)
}

export function isRetryableError(error: Error): boolean {
  if (error instanceof AIError) {
    return error.retryable
  }
  return false
}
