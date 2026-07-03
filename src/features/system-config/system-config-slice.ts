import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SystemConfigState {
  tenantId: string | null;
}

const initialState: SystemConfigState = {
  tenantId: null,
};

const systemConfigSlice = createSlice({
  name: "systemConfig",
  initialState,
  reducers: {
    setConfigTenantId(state, action: PayloadAction<string | null>) {
      state.tenantId = action.payload;
    },
  },
});

export const { setConfigTenantId } = systemConfigSlice.actions;
export const systemConfigReducer = systemConfigSlice.reducer;
