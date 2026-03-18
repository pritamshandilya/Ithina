import { combineReducers, configureStore } from "@reduxjs/toolkit";

import campaignReducer from "./slices/campaign-slice";
import studioReducer from "./slices/studio-slice";
import templatesReducer from "./slices/templates-slice";
import uiReducer from "./slices/ui-slice";
import wizardReducer from "./slices/wizard-slice";

const rootReducer = combineReducers({
  ui: uiReducer,
  campaign: campaignReducer,
  wizard: wizardReducer,
  studio: studioReducer,
  templates: templatesReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
