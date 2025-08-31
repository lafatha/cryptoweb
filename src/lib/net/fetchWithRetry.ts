interface FetchWithRetryOptions {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  opts: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 12000,
    retries = 1,
    backoffMs = 1000
  } = opts;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = new Error('TIMEOUT');
        } else {
          lastError = error;
        }
      } else {
        lastError = new Error('UNKNOWN_ERROR');
      }

      // If this isn't the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}
