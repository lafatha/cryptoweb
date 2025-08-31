import { AIError, createAIError, isRetryableError } from './errors'

interface GroqConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
  retries?: number
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class GroqClient {
  private config: Required<GroqConfig>

  constructor(config: GroqConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.groq.com/openai/v1',
      timeout: config.timeout || 12000,
      retries: config.retries || 2
    }
  }

  async chatCompletion(
    messages: GroqMessage[],
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      responseFormat?: { type: 'json_object' | 'text' }
      stream?: boolean
    } = {}
  ): Promise<GroqResponse> {
    const {
      model = 'llama-3.3-70b-versatile',
      temperature = 0.7,
      maxTokens = 1500,
      responseFormat,
      stream = false
    } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const body: any = {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream
        }

        if (responseFormat) {
          body.response_format = responseFormat
        }

        const response = await fetch(`${this.config.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          
          if (response.status === 401) {
            throw createAIError('LLM_DOWN', `Invalid API key: ${response.status}`)
          }
          
          if (response.status === 429) {
            throw createAIError('RATE_LIMIT', `Rate limited: ${response.status}`)
          }
          
          if (response.status >= 500) {
            throw createAIError('LLM_DOWN', `Server error: ${response.status}`)
          }
          
          throw createAIError('LLM_DOWN', `HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        return data

      } catch (error) {
        lastError = error as Error
        
        // Don't retry on non-retryable errors
        if (error instanceof AIError && !isRetryableError(error)) {
          throw error
        }
        
        // Don't retry on last attempt
        if (attempt === this.config.retries) {
          break
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof AIError) {
      throw lastError
    }
    
    // Handle network/timeout errors
    if (lastError?.name === 'AbortError') {
      throw createAIError('TIMEOUT', 'Request timeout after retries')
    }
    
    throw createAIError('LLM_DOWN', `Network error after retries: ${lastError?.message}`)
  }

  async *streamChatCompletion(
    messages: GroqMessage[],
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      model = 'llama-3.3-70b-versatile',
      temperature = 0.7,
      maxTokens = 1500
    } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        
        if (response.status === 429) {
          throw createAIError('RATE_LIMIT', `Rate limited: ${response.status}`)
        }
        
        throw createAIError('LLM_DOWN', `HTTP ${response.status}: ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw createAIError('LLM_DOWN', 'No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue
            }
          }
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error instanceof AIError) {
        throw error
      }
      
      if (error?.name === 'AbortError') {
        throw createAIError('TIMEOUT', 'Streaming timeout')
      }
      
      throw createAIError('LLM_DOWN', `Streaming error: ${error?.message || 'Unknown error'}`)
    }
  }
}

// Singleton instance
let groqClient: GroqClient | null = null

export function getGroqClient(): GroqClient {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createAIError('LLM_DOWN', 'GROQ_API_KEY not configured')
    }
    groqClient = new GroqClient({ apiKey })
  }
  return groqClient
}

// Convenience functions
export async function groqJson(
  messages: GroqMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    timeoutMs?: number
    retries?: number
  } = {}
): Promise<any> {
  const client = getGroqClient()
  
  // Override client config if specified
  if (options.timeoutMs || options.retries) {
    const customClient = new GroqClient({
      apiKey: process.env.GROQ_API_KEY!,
      timeout: options.timeoutMs,
      retries: options.retries
    })
    
    const response = await customClient.chatCompletion(messages, {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      responseFormat: { type: 'json_object' }
    })
    
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw createAIError('BAD_JSON', 'Empty response from AI')
    }
    
    try {
      return JSON.parse(content)
    } catch (e) {
      throw createAIError('BAD_JSON', `Invalid JSON: ${e}`)
    }
  }
  
  const response = await client.chatCompletion(messages, {
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    responseFormat: { type: 'json_object' }
  })
  
  const content = response.choices[0]?.message?.content
  if (!content) {
    throw createAIError('BAD_JSON', 'Empty response from AI')
  }
  
  try {
    return JSON.parse(content)
  } catch (e) {
    throw createAIError('BAD_JSON', `Invalid JSON: ${e}`)
  }
}

export async function* groqStream(
  messages: GroqMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): AsyncGenerator<string, void, unknown> {
  const client = getGroqClient()
  yield* client.streamChatCompletion(messages, options)
}
