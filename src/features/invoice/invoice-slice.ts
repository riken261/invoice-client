import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface InvoiceFilters {
  keyword: string;
  status: string | null;
}

export interface InvoiceOcrSessionDraft {
  fileId?: string;
  fields: Record<string, unknown>;
  invoiceId?: string;
  preview?: {
    imageUrl?: string;
    filename?: string;
  };
  raw?: unknown;
  sessionId: string;
  status?: string;
}

interface InvoiceState {
  filters: InvoiceFilters;
  ocrSessionDrafts: Record<string, InvoiceOcrSessionDraft>;
  selectedInvoiceId: string | null;
}

const initialState: InvoiceState = {
  filters: {
    keyword: "",
    status: null,
  },
  ocrSessionDrafts: {},
  selectedInvoiceId: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setInvoiceFilters(state, action: PayloadAction<Partial<InvoiceFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearOcrSessionDrafts(state) {
      state.ocrSessionDrafts = {};
    },
    setOcrSessionDraft(state, action: PayloadAction<InvoiceOcrSessionDraft>) {
      state.ocrSessionDrafts = { [action.payload.sessionId]: action.payload };
    },
    setOcrSessionDrafts(
      state,
      action: PayloadAction<Record<string, InvoiceOcrSessionDraft>>,
    ) {
      state.ocrSessionDrafts = action.payload;
    },
    setSelectedInvoiceId(state, action: PayloadAction<string | null>) {
      state.selectedInvoiceId = action.payload;
    },
  },
});

export const {
  clearOcrSessionDrafts,
  setInvoiceFilters,
  setOcrSessionDraft,
  setOcrSessionDrafts,
  setSelectedInvoiceId,
} = invoiceSlice.actions;
export const invoiceReducer = invoiceSlice.reducer;
