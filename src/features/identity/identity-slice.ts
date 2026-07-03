import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CurrentUser {
  id: string;
  tenantId: string;
  tenantCode?: string;
  username?: string;
  displayName: string;
  email: string;
  departmentId?: string;
  roles: string[];
  permissions: string[];
}

interface IdentityState {
  currentUser: CurrentUser | null;
  sessionReady: boolean;
}

const initialState: IdentityState = {
  currentUser: null,
  sessionReady: false,
};

const identitySlice = createSlice({
  name: "identity",
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<CurrentUser | null>) {
      state.currentUser = action.payload;
      state.sessionReady = true;
    },
    clearSession(state) {
      state.currentUser = null;
      state.sessionReady = true;
    },
  },
});

export const { clearSession, setCurrentUser } = identitySlice.actions;
export const identityReducer = identitySlice.reducer;
