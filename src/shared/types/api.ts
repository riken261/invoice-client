export interface ApiErrorPayload {
  code: string;
  message: string;
  traceId?: string;
  details?: unknown;
}

export interface RestErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiPageRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface ApiPageResponse<T> {
  records: T[];
  page: number;
  size: number;
  total: number;
}

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
  traceId?: string;
}

export interface RestResponse<T> {
  success: boolean;
  traceId?: string;
  data?: T;
  error?: RestErrorPayload;
}
