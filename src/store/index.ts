import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import sessionStorage from "redux-persist/lib/storage/session";

import {
  authReducer,
  profileReducer,
  storeContextReducer,
  uiReducer,
} from "./reducers";
import { planogramPreviewReducer } from "./slices/planogramPreviewSlice";
import { shelvesReducer } from "./slices/shelvesSlice";

type PersistStorageModule = typeof storage | { default: typeof storage };

function resolvePersistStorage(module: PersistStorageModule): typeof storage {
  return "getItem" in module ? module : module.default;
}

const localPersistStorage = resolvePersistStorage(storage);
const sessionPersistStorage = resolvePersistStorage(sessionStorage);

const authPersistConfig = {
  key: "auth",
  storage: sessionPersistStorage,
  whitelist: ["token", "tokenExpiry", "user"],
};

const storeContextPersistConfig = {
  key: "storeContext",
  storage: localPersistStorage,
  whitelist: ["selectedStore"],
};

const uiPersistConfig = {
  key: "ui",
  storage: localPersistStorage,
  whitelist: ["sidebarOpen"],
};

const profilePersistConfig = {
  key: "profile",
  storage: localPersistStorage,
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
