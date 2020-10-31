/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { AnyAction, configureStore } from "@reduxjs/toolkit";
import { createMigrate, persistReducer, persistStore } from "redux-persist";
import localForage from "localforage";
import rootReducer, { IState } from "./modules";
// @ts-ignore
import backendMiddleware from "../middlewares/backendMiddleware";
import apiMiddleware from "../store/middlewares/api";
import { changeConnectionStatus } from "../actions/network";
import thunk from "redux-thunk";
import { updateTokens } from "../actions/auth";

const middleware = [
  thunk,
  //@ts-ignore
  apiMiddleware(updateTokens, changeConnectionStatus),
  backendMiddleware(updateTokens, changeConnectionStatus),
];

const version = 5;

const migrations = {
  // 1.3.11
  2: (state: any) => ({
    ...state,
    settings: {
      ...state.settings,
      sidebar: {
        isOpen: false,
        isObjectsOpen: true,
      },
    },
  }),
  // 1.4.0
  3: (state: any) => ({
    ...state,
    settings: {
      ...state.settings,
      sidebar: {
        isOpen: state.settings.isVisible,
        itemsStates: { objects: !!state.settings.isObjectsOpen },
      },
    },
  }),
  // 1.4.1
  4: (state: any) => ({
    ...state,
    settings: {
      ...state.settings,
      objectsPage: {
        filter: {
          objectName: "",
          companies: [],
        },
        groupsVisibilities: {},
      },
    },
  }),
  // 1.4.10
  5: (state: any) => ({
    ...state,
    settings: {
      ...state.settings,
      locationSelect: {},
    },
  }),
};

const storage = localForage.createInstance({
  driver: [localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE],
  name: "tehnadzor",
  storeName: "store",
});

const rootPersistConfig = {
  keyPrefix: "tehnadzor/",
  key: "root",
  storage,
  whitelist: ["localEntities", "settings"],
  version,
  debug: process.env.NODE_ENV === "development",
  migrate: createMigrate(migrations, {
    debug: process.env.NODE_ENV === "development",
  }),
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore<IState, AnyAction, typeof middleware>({
  // @ts-ignore
  reducer: persistedReducer,
  middleware,
  devTools: process.env.NODE_ENV === "development",
  preloadedState: {},
});
export const persistor = persistStore(store);

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept("./modules", () => {
    // eslint-disable-next-line global-require
    const nextRootReducer = require("./modules").default;
    // @ts-ignore
    store.replaceReducer(persistReducer(rootPersistConfig, nextRootReducer));
  });
}

export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;
