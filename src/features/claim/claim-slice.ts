import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ClaimState {
  draftInvoiceIds: string[];
  selectedClaimId: string | null;
}

const initialState: ClaimState = {
  draftInvoiceIds: [],
  selectedClaimId: null,
};

const claimSlice = createSlice({
  name: "claim",
  initialState,
  reducers: {
    setDraftInvoiceIds(state, action: PayloadAction<string[]>) {
      state.draftInvoiceIds = action.payload;
    },
    setSelectedClaimId(state, action: PayloadAction<string | null>) {
      state.selectedClaimId = action.payload;
    },
  },
});

export const { setDraftInvoiceIds, setSelectedClaimId } = claimSlice.actions;
export const claimReducer = claimSlice.reducer;
