import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DuplicateState {
  riskOnly: boolean;
  selectedResultId: string | null;
}

const initialState: DuplicateState = {
  riskOnly: true,
  selectedResultId: null,
};

const duplicateSlice = createSlice({
  name: "duplicate",
  initialState,
  reducers: {
    setRiskOnly(state, action: PayloadAction<boolean>) {
      state.riskOnly = action.payload;
    },
    setSelectedDuplicateResultId(state, action: PayloadAction<string | null>) {
      state.selectedResultId = action.payload;
    },
  },
});

export const { setRiskOnly, setSelectedDuplicateResultId } =
  duplicateSlice.actions;
export const duplicateReducer = duplicateSlice.reducer;
