import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import type { InvestmentPosition } from "@/types/investment";

type InvestmentsState = {
  items: InvestmentPosition[];
  loading: boolean;
  error: string | null;
};

const initialState: InvestmentsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchInvestments = createAsyncThunk(
  "investments/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ items: InvestmentPosition[] }>(
        "/api/investments",
      );
      return data.items;
    } catch {
      return rejectWithValue("Portföy yüklenemedi");
    }
  },
);

export const addInvestment = createAsyncThunk(
  "investments/add",
  async (
    payload: {
      assetType: "GOLD" | "STOCK";
      goldSubtype?: string | null;
      title: string;
      ticker?: string | null;
      quantity: number;
      avgCostPerUnitTry: number;
      marketPricePerUnitTry?: number | null;
      note?: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post<InvestmentPosition>(
        "/api/investments",
        payload,
      );
      return data;
    } catch {
      return rejectWithValue("Kayıt oluşturulamadı");
    }
  },
);

export const updateInvestment = createAsyncThunk(
  "investments/update",
  async (
    arg: { id: string; body: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.put<InvestmentPosition>(
        `/api/investments/${arg.id}`,
        arg.body,
      );
      return data;
    } catch {
      return rejectWithValue("Güncellenemedi");
    }
  },
);

export const deleteInvestment = createAsyncThunk(
  "investments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/investments/${id}`);
      return id;
    } catch {
      return rejectWithValue("Silinemedi");
    }
  },
);

const investmentsSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Hata oluştu";
      })
      .addCase(addInvestment.fulfilled, () => {})
      .addCase(updateInvestment.fulfilled, () => {})
      .addCase(deleteInvestment.fulfilled, () => {});
  },
});

export default investmentsSlice.reducer;
