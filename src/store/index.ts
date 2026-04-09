import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import sessionStorage from "redux-persist/lib/storage/session";
import {
  authReducer,
  storeContextReducer,
  uiReducer,
  profileReducer,
} from "./reducers";
import { shelvesReducer } from "./slices/shelvesSlice";
import { planogramPreviewReducer } from "./slices/planogramPreviewSlice";

const authPersistConfig = {
  key: "auth",
  storage: sessionStorage,
  whitelist: ["token", "tokenExpiry", "user"],
};

const storeContextPersistConfig = {
  key: "storeContext",
  storage,
  whitelist: ["selectedStore"],
};

const uiPersistConfig = {
  key: "ui",
  storage,
  whitelist: ["sidebarOpen"],
};

const profilePersistConfig = {
  key: "profile",
  storage,
  whitelist: ["firstName", "lastName", "profilePictureUrl"],
};

const persistedRootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  storeContext: persistReducer(storeContextPersistConfig, storeContextReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  profile: persistReducer(profilePersistConfig, profileReducer),
  shelves: shelvesReducer,
  planogramPreview: planogramPreviewReducer,
});

const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
