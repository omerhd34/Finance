import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlice";
import debtsReducer from "./slices/debtsSlice";
import investmentsReducer from "./slices/investmentsSlice";
import recurringReducer from "./slices/recurringSlice";
import type { AuthState } from "./slices/authSlice";
import type { DebtsState } from "./slices/debtsSlice";
import type { InvestmentsState } from "./slices/investmentsSlice";
import type { RecurringState } from "./slices/recurringSlice";
import type { TransactionState } from "./slices/transactionSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      transactions: transactionReducer,
      debts: debtsReducer,
      investments: investmentsReducer,
      recurring: recurringReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = {
  auth: AuthState;
  transactions: TransactionState;
  debts: DebtsState;
  investments: InvestmentsState;
  recurring: RecurringState;
};
export type AppDispatch = AppStore["dispatch"];
