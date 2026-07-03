import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FileArchiveState {
  previewFileId: string | null;
}

const initialState: FileArchiveState = {
  previewFileId: null,
};

const fileArchiveSlice = createSlice({
  name: "fileArchive",
  initialState,
  reducers: {
    setPreviewFileId(state, action: PayloadAction<string | null>) {
      state.previewFileId = action.payload;
    },
  },
});

export const { setPreviewFileId } = fileArchiveSlice.actions;
export const fileArchiveReducer = fileArchiveSlice.reducer;
