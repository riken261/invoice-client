import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";
export type SupportedLanguage = "zh-CN" | "en" | "ja";

interface AppPreferencesState {
  language: SupportedLanguage;
  theme: ThemeMode;
}

const initialState: AppPreferencesState = {
  language: "zh-CN",
  theme: "system",
};

const appPreferencesSlice = createSlice({
  name: "appPreferences",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<SupportedLanguage>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
  },
});

export const { setLanguage, setTheme } = appPreferencesSlice.actions;
export const appPreferencesReducer = appPreferencesSlice.reducer;
