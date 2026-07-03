import { request } from "@/hooks/http";
import {
  AUTH_CALLBACK_BASE_URL,
  AUTH_SERVICE_PREFIX,
} from "@/hooks/http/config";
import type { CurrentUser } from "@/features/identity/identity-slice";
import type { AuthUser } from "@/features/auth/auth-slice";

export const DEFAULT_TENANT_CODE =
  import.meta.env.VITE_DEFAULT_TENANT_CODE ?? "invoice";

export interface LoginUrlRequest {
  tenantCode?: string;
  redirectUri?: string;
}

export interface LoginUrlResponse {
  loginUrl: string;
  expiresInSeconds: number;
}

export interface MenuItemResponse {
  code: string;
  label: string;
  path: string;
}

export interface CurrentUserResponse {
  userId: string;
  tenantId: string;
  tenantCode: string;
  username: string;
  displayName: string;
  email: string;
  departmentId?: string;
  roles: string[];
  permissions: string[];
  menus?: MenuItemResponse[];
}

export interface LogoutResponse {
  success: boolean;
}

export function getSsoRedirectUri() {
  return `${AUTH_CALLBACK_BASE_URL}/callback`;
}

function getAuthRequestUrl(path: string) {
  return `${window.location.origin}${AUTH_SERVICE_PREFIX}${path}`;
}

export function createLoginUrl({
  redirectUri = getSsoRedirectUri(),
  tenantCode = DEFAULT_TENANT_CODE,
}: LoginUrlRequest = {}) {
  return request<LoginUrlResponse>({
    method: "GET",
    params: {
      redirectUri,
      tenantCode,
    },
    url: getAuthRequestUrl("/login-url"),
  });
}

export function getCurrentUser() {
  return request<CurrentUserResponse>({
    method: "GET",
    url: getAuthRequestUrl("/me"),
  });
}

export function toCurrentUser(response: CurrentUserResponse): CurrentUser {
  return {
    departmentId: response.departmentId,
    displayName: response.displayName,
    email: response.email,
    id: response.userId,
    permissions: response.permissions,
    roles: response.roles,
    tenantCode: response.tenantCode,
    tenantId: response.tenantId,
    username: response.username,
  };
}

export function toAuthUser(response: CurrentUserResponse): AuthUser {
  return {
    departmentId: response.departmentId,
    displayName: response.displayName,
    email: response.email,
    menus: response.menus ?? [],
    permissions: response.permissions,
    roles: response.roles,
    tenantCode: response.tenantCode,
    tenantId: response.tenantId,
    userId: response.userId,
    username: response.username,
  };
}

export function logout() {
  return request<LogoutResponse>({
    method: "POST",
    url: getAuthRequestUrl("/logout"),
  });
}
