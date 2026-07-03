import { configureStore } from "@reduxjs/toolkit";

import { rootReducer } from "./root-reducer";

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
