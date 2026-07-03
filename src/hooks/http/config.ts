export const GATEWAY_BASE_URL =
  import.meta.env.VITE_GATEWAY_BASE_URL || "http://192.168.3.25:8080";

export const API_BASE_URL = import.meta.env.VITE_BFF_BASE_URL ?? "";

export const AUTH_SERVICE_PREFIX = "/invoice-authorization-service/bff/v1/auth";

export const AUTH_CALLBACK_BASE_URL = `${GATEWAY_BASE_URL.replace(
  /\/$/,
  "",
)}${AUTH_SERVICE_PREFIX}`;

export const API_TIMEOUT_MS = import.meta.env.VITE_BFF_TIMEOUT_MS ?? 30_000;

export const CSRF_HEADER = "X-CSRF-Token";
