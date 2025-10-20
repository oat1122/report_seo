// src/types/common.ts
/**
 * Represents the structure of a standardized API error response.
 */
export interface ApiError {
  error: string;
}

/**
 * Represents the structure of an error from Axios,
 * which may contain a response object with a data property.
 */
export interface AxiosErrorResponse {
  response?: {
    data?: ApiError;
  };
}
