import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ReviewState {
  queueStatus: string | null;
  selectedReviewId: string | null;
}

const initialState: ReviewState = {
  queueStatus: null,
  selectedReviewId: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setQueueStatus(state, action: PayloadAction<string | null>) {
      state.queueStatus = action.payload;
    },
    setSelectedReviewId(state, action: PayloadAction<string | null>) {
      state.selectedReviewId = action.payload;
    },
  },
});

export const { setQueueStatus, setSelectedReviewId } = reviewSlice.actions;
export const reviewReducer = reviewSlice.reducer;
