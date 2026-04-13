import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import type { Transaction } from "@/types/transaction";

export type TransactionFilters = {
  type: "" | "income" | "expense";
  category: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};

type ListResponse = {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};

const initialFilters: TransactionFilters = {
  type: "",
  category: "",
  dateFrom: "",
  dateTo: "",
  search: "",
};

type TransactionState = {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  total: number;
  page: number;
  pageSize: number;
};

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
  filters: initialFilters,
  total: 0,
  page: 1,
  pageSize: 10,
};

function buildQuery(
  filters: TransactionFilters,
  page: number,
  pageSize: number,
): string {
  const p = new URLSearchParams();
  if (filters.type) p.set("type", filters.type);
  if (filters.category) p.set("category", filters.category);
  if (filters.dateFrom) p.set("from", filters.dateFrom);
  if (filters.dateTo) p.set("to", filters.dateTo);
  if (filters.search.trim()) p.set("search", filters.search.trim());
  p.set("page", String(page));
  p.set("pageSize", String(pageSize));
  return p.toString();
}

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (
    arg: { filters: TransactionFilters; page: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const q = buildQuery(arg.filters, arg.page, arg.pageSize);
      const { data } = await apiClient.get<ListResponse>(
        `/api/transactions?${q}`,
      );
      return data;
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: string } } }).response?.data
                ?.error ?? "Yükleme başarısız",
            )
          : "Yükleme başarısız";
      return rejectWithValue(msg);
    }
  },
);

export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (
    payload: {
      type: "income" | "expense";
      amount: number;
      category: string;
      description?: string;
      date: Date;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post<Transaction>("/api/transactions", {
        ...payload,
        date: payload.date.toISOString(),
      });
      return data;
    } catch {
      return rejectWithValue("Kayıt başarısız");
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async (
    arg: { id: string; body: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.put<Transaction>(
        `/api/transactions/${arg.id}`,
        arg.body,
      );
      return data;
    } catch {
      return rejectWithValue("Güncelleme başarısız");
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/transactions/${id}`);
      return id;
    } catch {
      return rejectWithValue("Silinemedi");
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Bir hata oluştu";
      })
      .addCase(addTransaction.fulfilled, () => {})
      .addCase(updateTransaction.fulfilled, () => {})
      .addCase(deleteTransaction.fulfilled, () => {});
  },
});

export const { setFilters, setPage, setPageSize, resetFilters } =
  transactionSlice.actions;
export default transactionSlice.reducer;
