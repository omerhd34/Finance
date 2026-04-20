import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { parseApiErrorForUser } from "@/lib/email-verification-client";
import type { RecurringRule } from "@/types/recurring";
import {
  fetchTransactions,
  type TransactionFilters,
} from "@/store/slices/transactionSlice";

export type RecurringState = {
  items: RecurringRule[];
  loading: boolean;
  error: string | null;
};

const initialState: RecurringState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchRecurringRules = createAsyncThunk(
  "recurring/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ items: RecurringRule[] }>(
        "/api/recurring",
      );
      return data.items;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Kayıtlar yüklenemedi"));
    }
  },
);

export const addRecurringRule = createAsyncThunk(
  "recurring/add",
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<RecurringRule>(
        "/api/recurring",
        payload,
      );
      return data;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Oluşturulamadı"));
    }
  },
);

export const updateRecurringRule = createAsyncThunk(
  "recurring/update",
  async (
    arg: { id: string; body: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.put<RecurringRule>(
        `/api/recurring/${arg.id}`,
        arg.body,
      );
      return data;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Güncellenemedi"));
    }
  },
);

export const deleteRecurringRule = createAsyncThunk(
  "recurring/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/recurring/${id}`);
      return id;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Silinemedi"));
    }
  },
);

export const processDueRecurring = createAsyncThunk(
  "recurring/processDue",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ created: number }>(
        "/api/recurring/process-due",
      );
      if (data.created > 0) {
        const st = getState() as {
          transactions: {
            filters: TransactionFilters;
            page: number;
            pageSize: number;
          };
        };
        await dispatch(
          fetchTransactions({
            filters: st.transactions.filters,
            page: st.transactions.page,
            pageSize: st.transactions.pageSize,
          }),
        );
      }
      return data.created;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "İşlenemedi"));
    }
  },
);

export const fulfillRecurringReminderThunk = createAsyncThunk(
  "recurring/fulfill",
  async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
      await apiClient.post(`/api/recurring/${id}/fulfill`);
      await dispatch(fetchRecurringRules());
      const st = getState() as {
        transactions: {
          filters: TransactionFilters;
          page: number;
          pageSize: number;
        };
      };
      await dispatch(
        fetchTransactions({
          filters: st.transactions.filters,
          page: st.transactions.page,
          pageSize: st.transactions.pageSize,
        }),
      );
      return id;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "İşlem oluşturulamadı"));
    }
  },
);

export const skipRecurringReminderThunk = createAsyncThunk(
  "recurring/skip",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.post(`/api/recurring/${id}/skip`);
      await dispatch(fetchRecurringRules());
      return id;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Ertelenemedi"));
    }
  },
);

const recurringSlice = createSlice({
  name: "recurring",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurringRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRecurringRules.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Bir hata oluştu";
      })
      .addCase(addRecurringRule.fulfilled, () => {})
      .addCase(updateRecurringRule.fulfilled, () => {})
      .addCase(deleteRecurringRule.fulfilled, () => {});
  },
});

export default recurringSlice.reducer;
