import { combineReducers, configureStore } from "@reduxjs/toolkit";

import campaignReducer from "./slices/campaign-slice";
import uiReducer from "./slices/ui-slice";

const rootReducer = combineReducers({
  ui: uiReducer,
  campaign: campaignReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
