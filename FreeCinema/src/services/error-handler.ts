
// Global error handler for API requests

export class APIError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export const handleAPIError = (error: unknown): APIError => {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return error;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
      return new APIError('Network connection error. Please check your internet connection.', 0);
    }
    return new APIError(error.message);
  }
  
  return new APIError('Unknown error occurred');
};

export const errorToast = (error: unknown): string => {
  if (error instanceof APIError) {
    if (error.status === 404) {
      return "Content not found. This may not be available in our database.";
    } else if (error.status === 429) {
      return "Too many requests. Please try again in a moment.";
    } else if (error.status && error.status >= 500) {
      return "Server error. Our team is working to fix this issue.";
    }
    return error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
      return 'Network connection error. Please check your internet connection.';
    }
    return error.message;
  }
  
  return 'Unknown error occurred';
};

// Function to safely fetch data with error handling
export const safeFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      // Try to get more detailed error info from the response
      try {
        const errorData = await response.json();
        if (errorData && errorData.status_message) {
          errorMessage = errorData.status_message;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      throw new APIError(errorMessage, response.status);
    }
    
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError('Request timed out. Please try again later.', 408);
    }
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new APIError('Network error or CORS issue. Please check your internet connection.', 0);
    }
    
    throw error;
  }
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying... ${retries} attempts left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

// Format and display user-friendly error messages
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        return "Authentication error. Please refresh the page and try again.";
      case 403:
        return "You don't have permission to access this content.";
      case 404:
        return "Content not found. It may have been removed or is unavailable.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Server error. Our team has been notified and is working on it.";
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network error') ||
        error.message.includes('NetworkError')) {
      return "Network connection issue. Please check your internet and try again.";
    }
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again later.";
};
