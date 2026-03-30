import { combineReducers, configureStore } from "@reduxjs/toolkit";

<<<<<<< Updated upstream
=======
import campaignReducer from "./slices/campaign-slice";
import sessionReducer from "./slices/session-slice.ts";
import studioReducer from "./slices/studio-slice";
import templatesReducer from "./slices/templates-slice";
>>>>>>> Stashed changes
import uiReducer from "./slices/ui-slice";

const rootReducer = combineReducers({
  ui: uiReducer,
<<<<<<< Updated upstream
=======
  session: sessionReducer,
  campaign: campaignReducer,
  wizard: wizardReducer,
  studio: studioReducer,
  templates: templatesReducer,
>>>>>>> Stashed changes
});

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
