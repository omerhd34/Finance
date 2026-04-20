import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { parseApiErrorForUser } from "@/lib/email-verification-client";
import type { Debt } from "@/types/debt";

export type DebtsState = {
  items: Debt[];
  loading: boolean;
  error: string | null;
};

const initialState: DebtsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchDebts = createAsyncThunk(
  "debts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ items: Debt[] }>("/api/debts");
      return data.items;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Kayıtlar yüklenemedi"));
    }
  },
);

export const addDebt = createAsyncThunk(
  "debts/add",
  async (
    payload: {
      direction: "RECEIVABLE" | "PAYABLE";
      counterparty: string;
      totalAmount: number;
      paidAmount?: number;
      dueDate?: Date | null;
      note?: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post<Debt>("/api/debts", {
        direction: payload.direction,
        counterparty: payload.counterparty,
        totalAmount: payload.totalAmount,
        paidAmount: payload.paidAmount ?? 0,
        dueDate: payload.dueDate ?? null,
        note: payload.note ?? null,
      });
      return data;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Kayıt oluşturulamadı"));
    }
  },
);

export const updateDebt = createAsyncThunk(
  "debts/update",
  async (
    arg: { id: string; body: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.put<Debt>(
        `/api/debts/${arg.id}`,
        arg.body,
      );
      return data;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Güncellenemedi"));
    }
  },
);

export const deleteDebt = createAsyncThunk(
  "debts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/debts/${id}`);
      return id;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Silinemedi"));
    }
  },
);

const debtsSlice = createSlice({
  name: "debts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDebts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDebts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDebts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Hata oluştu";
      })
      .addCase(addDebt.fulfilled, () => {})
      .addCase(updateDebt.fulfilled, () => {})
      .addCase(deleteDebt.fulfilled, () => {});
  },
});

export default debtsSlice.reducer;
