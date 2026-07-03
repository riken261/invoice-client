import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AxiosRequestConfig, Method } from "axios";

import { request } from "./client";

type HttpStatus = "idle" | "loading" | "success" | "error";

export interface UseHttpOptions<TData> extends AxiosRequestConfig {
  immediate?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
}

export interface UseHttpResult<TData> {
  data: TData | null;
  error: unknown;
  execute: (override?: AxiosRequestConfig) => Promise<TData>;
  isError: boolean;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  status: HttpStatus;
}

export function useHttp<TData>(
  options: UseHttpOptions<TData>,
): UseHttpResult<TData>;
export function useHttp<TData>(
  method: Method,
  url: string,
  options?: UseHttpOptions<TData>,
): UseHttpResult<TData>;
export function useHttp<TData>(
  methodOrOptions: Method | UseHttpOptions<TData>,
  url?: string,
  options?: UseHttpOptions<TData>,
) {
  const config = useMemo(
    () =>
      typeof methodOrOptions === "string"
        ? { ...options, method: methodOrOptions, url }
        : methodOrOptions,
    [methodOrOptions, options, url],
  );
  const optionsRef = useRef(config);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<HttpStatus>(
    config.immediate ? "loading" : "idle",
  );

  useEffect(() => {
    optionsRef.current = config;
  }, [config]);

  const execute = useCallback(async (override?: AxiosRequestConfig) => {
    setStatus("loading");
    setError(null);

    try {
      const result = await request<TData>({
        ...optionsRef.current,
        ...override,
      });
      setData(result);
      setStatus("success");
      optionsRef.current.onSuccess?.(result);
      return result;
    } catch (caught) {
      setError(caught);
      setStatus("error");
      optionsRef.current.onError?.(caught);
      throw caught;
    }
  }, []);

  useEffect(() => {
    if (config.immediate) {
      queueMicrotask(() => void execute());
    }
  }, [execute, config.immediate]);

  return {
    data,
    error,
    execute,
    isError: status === "error",
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    status,
  };
}

export function useGet<TData>(url: string, options?: UseHttpOptions<TData>) {
  return useHttp<TData>("GET", url, options);
}

export function usePost<TData>(url: string, options?: UseHttpOptions<TData>) {
  return useHttp<TData>("POST", url, options);
}

export function usePut<TData>(url: string, options?: UseHttpOptions<TData>) {
  return useHttp<TData>("PUT", url, options);
}

export function useDelete<TData>(url: string, options?: UseHttpOptions<TData>) {
  return useHttp<TData>("DELETE", url, options);
}
