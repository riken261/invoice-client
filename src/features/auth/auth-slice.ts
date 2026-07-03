import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthMenuItem {
  code: string;
  label: string;
  path: string;
}

export interface AuthUser {
  userId: string;
  tenantId: string;
  tenantCode: string;
  username: string;
  displayName: string;
  email: string;
  departmentId?: string;
  roles: string[];
  permissions: string[];
  menus: AuthMenuItem[];
}

interface AuthState {
  currentUser: AuthUser | null;
  sessionReady: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  sessionReady: false,
};

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    clearAuthSession(state) {
      state.currentUser = null;
      state.sessionReady = true;
    },
    setAuthUser(state, action: PayloadAction<AuthUser>) {
      state.currentUser = action.payload;
      state.sessionReady = true;
    },
  },
});

export const { clearAuthSession, setAuthUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
