import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuditState {
  actorId: string | null;
  action: string | null;
}

const initialState: AuditState = {
  actorId: null,
  action: null,
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    setAuditFilters(state, action: PayloadAction<Partial<AuditState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAuditFilters } = auditSlice.actions;
export const auditReducer = auditSlice.reducer;
