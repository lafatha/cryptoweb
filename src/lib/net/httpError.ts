export interface HttpErrorResponse {
  status: number;
  code: string;
  message: string;
}

export type ServiceType = "LLM" | "MORALIS" | "CG" | "CP";

export function mapError(e: unknown, service: ServiceType): HttpErrorResponse {
  const errorStr = String(e);
  
  // Handle HTTP errors
  if (errorStr.includes('HTTP_')) {
    const statusMatch = errorStr.match(/HTTP_(\d+)/);
    if (statusMatch) {
      const httpStatus = parseInt(statusMatch[1]);
      
      // Service-specific mappings
      if (service === "LLM") {
        if (httpStatus >= 500) {
          return {
            status: 503,
            code: "LLM_DOWN",
            message: "AI service temporarily unavailable"
          };
        } else if (httpStatus >= 400) {
          return {
            status: 500,
            code: "LLM_FAIL",
            message: "AI service request failed"
          };
        }
      }
      
      if (service === "CG" && httpStatus === 429) {
        return {
          status: 429,
          code: "CG_RATE_LIMIT",
          message: "CoinGecko rate limit exceeded"
        };
      }
      
      if (service === "MORALIS" && httpStatus === 429) {
        return {
          status: 429,
          code: "MORALIS_RATE_LIMIT",
          message: "Moralis rate limit exceeded"
        };
      }
      
      if (service === "CP" && httpStatus === 429) {
        return {
          status: 429,
          code: "CP_RATE_LIMIT",
          message: "CryptoPanic rate limit exceeded"
        };
      }
    }
  }
  
  // Handle timeout errors
  if (errorStr.includes('TIMEOUT')) {
    if (service === "LLM") {
      return {
        status: 503,
        code: "LLM_TIMEOUT",
        message: "AI service timeout"
      };
    }
    return {
      status: 503,
      code: "NETWORK_ERROR",
      message: "Request timeout"
    };
  }
  
  // Handle network/connection errors
  if (errorStr.includes('fetch') || errorStr.includes('network') || errorStr.includes('ECONNREFUSED')) {
    return {
      status: 503,
      code: "NETWORK_ERROR",
      message: "Network connection failed"
    };
  }
  
  // Default server error
  return {
    status: 500,
    code: "SERVER_ERROR",
    message: "Internal server error"
  };
}
