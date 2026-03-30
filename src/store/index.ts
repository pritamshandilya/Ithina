import { combineReducers, configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slices/ui-slice";

const rootReducer = combineReducers({
  ui: uiReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
