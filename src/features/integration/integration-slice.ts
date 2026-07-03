import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface IntegrationState {
  outboxStatus: string | null;
}

const initialState: IntegrationState = {
  outboxStatus: "DEAD_LETTER",
};

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    setOutboxStatus(state, action: PayloadAction<string | null>) {
      state.outboxStatus = action.payload;
    },
  },
});

export const { setOutboxStatus } = integrationSlice.actions;
export const integrationReducer = integrationSlice.reducer;
