import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { API_BASE_URL, API_TIMEOUT_MS, CSRF_HEADER } from "./config";
import type {
  ApiErrorPayload,
  ApiResponse,
  RestResponse,
} from "@/shared/types/api";

export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly traceId?: string;
  readonly details?: unknown;

  constructor(payload: ApiErrorPayload, status?: number) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = status;
    this.traceId = payload.traceId;
    this.details = payload.details;
  }
}

function toApiErrorPayload(
  payload: ApiErrorPayload | unknown,
): ApiErrorPayload {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload
  ) {
    return payload as ApiErrorPayload;
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Unexpected API error",
    details: payload,
  };
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const csrfToken = document
    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
    ?.getAttribute("content");

  if (csrfToken) {
    config.headers.set(CSRF_HEADER, csrfToken);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload | RestResponse<unknown>>) => {
    const responseData = error.response?.data;
    const payload = isRestResponse<unknown>(responseData)
      ? {
          ...toApiErrorPayload(responseData.error),
          traceId: responseData.traceId,
        }
      : (responseData ?? {
          code: "NETWORK_ERROR",
          message: error.message,
        });

    throw new ApiError(payload, error.response?.status);
  },
);

export async function request<T>(config: AxiosRequestConfig) {
  const response = await httpClient.request<
    ApiResponse<T> | RestResponse<T> | T
  >(config);
  const payload = response.data;

  if (isRestResponse<T>(payload)) {
    if (payload.success) {
      return payload.data as T;
    }

    throw new ApiError(
      {
        ...toApiErrorPayload(payload.error),
        traceId: payload.traceId,
      },
      response.status,
    );
  }

  if (isApiResponse<T>(payload)) {
    return payload.data;
  }

  return payload;
}

function isApiResponse<T>(
  payload: ApiResponse<T> | RestResponse<T> | T,
): payload is ApiResponse<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload &&
    "data" in payload
  );
}

function isRestResponse<T>(
  payload: ApiResponse<T> | RestResponse<T> | T | undefined,
): payload is RestResponse<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    typeof payload.success === "boolean"
  );
}
