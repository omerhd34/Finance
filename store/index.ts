import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlice";
import goalsReducer from "./slices/goalsSlice";
import debtsReducer from "./slices/debtsSlice";
import investmentsReducer from "./slices/investmentsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      transactions: transactionReducer,
      goals: goalsReducer,
      debts: debtsReducer,
      investments: investmentsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
