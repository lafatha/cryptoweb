export type AIErrorCode = 'LLM_DOWN' | 'BAD_JSON' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'TIMEOUT'

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public userMessage: string
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export const ERROR_MESSAGES: Record<AIErrorCode, string> = {
  LLM_DOWN: 'AI layanan sementara tidak tersedia. Silakan coba lagi nanti.',
  BAD_JSON: 'Analisis gagal diproses. Silakan coba refresh.',
  RATE_LIMIT: 'Terlalu sering melakukan permintaan. Tunggu sebentar.',
  INVALID_INPUT: 'Data input tidak valid. Silakan periksa kembali.',
  TIMEOUT: 'Permintaan timeout. Silakan coba lagi.'
}

export function createAIError(code: AIErrorCode, details?: string): AIError {
  const userMessage = ERROR_MESSAGES[code]
  const systemMessage = details ? `${code}: ${details}` : code
  return new AIError(code, systemMessage, userMessage)
}

export function isRetryableError(error: any): boolean {
  if (error instanceof AIError) {
    return ['LLM_DOWN', 'TIMEOUT'].includes(error.code)
  }
  
  // Network errors, 5xx server errors
  if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ETIMEDOUT') {
    return true
  }
  
  if (error.status >= 500 && error.status < 600) {
    return true
  }
  
  return false
}
