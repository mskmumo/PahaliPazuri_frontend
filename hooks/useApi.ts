'use client';

import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/types/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  initialLoading?: boolean;
}

export function useApi<T = unknown, TArgs extends any[] = any[]>(
  apiFunction: (...args: TArgs) => Promise<T>,
  options?: UseApiOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(options?.initialLoading ?? false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response);
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err as { message?: string; errors?: Record<string, string[]>; status?: number };
        const apiError: ApiError = {
          message: error.message || 'An error occurred',
          errors: error.errors,
          status: error.status,
        };
        setError(apiError);
        options?.onError?.(apiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
