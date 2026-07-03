import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthorizationState {
  activeRole: string | null;
  permissionCodes: string[];
}

const initialState: AuthorizationState = {
  activeRole: null,
  permissionCodes: [],
};

const authorizationSlice = createSlice({
  name: "authorization",
  initialState,
  reducers: {
    setActiveRole(state, action: PayloadAction<string | null>) {
      state.activeRole = action.payload;
    },
    setPermissionCodes(state, action: PayloadAction<string[]>) {
      state.permissionCodes = action.payload;
    },
  },
});

export const { setActiveRole, setPermissionCodes } = authorizationSlice.actions;
export const authorizationReducer = authorizationSlice.reducer;
