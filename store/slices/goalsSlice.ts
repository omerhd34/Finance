import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { parseApiErrorForUser } from "@/lib/email-verification-client";
import type { Goal } from "@/types/goal";

export type GoalsState = {
  items: Goal[];
  loading: boolean;
  error: string | null;
};

const initialState: GoalsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  "goals/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ items: Goal[] }>("/api/goals");
      return data.items;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Hedefler yüklenemedi"));
    }
  },
);

export const addGoal = createAsyncThunk(
  "goals/add",
  async (
    payload: {
      title: string;
      targetAmount: number;
      deadline?: Date | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post<Goal>("/api/goals", {
        title: payload.title,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline ?? null,
      });
      return data;
    } catch (e: unknown) {
      return rejectWithValue(
        parseApiErrorForUser(e, "Hedef oluşturulamadı"),
      );
    }
  },
);

export const updateGoal = createAsyncThunk(
  "goals/update",
  async (
    arg: { id: string; body: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.put<Goal>(
        `/api/goals/${arg.id}`,
        arg.body,
      );
      return data;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Güncellenemedi"));
    }
  },
);

export const deleteGoal = createAsyncThunk(
  "goals/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/goals/${id}`);
      return id;
    } catch (e: unknown) {
      return rejectWithValue(parseApiErrorForUser(e, "Silinemedi"));
    }
  },
);

const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Hata oluştu";
      })
      .addCase(addGoal.fulfilled, () => {})
      .addCase(updateGoal.fulfilled, () => {})
      .addCase(deleteGoal.fulfilled, () => {});
  },
});

export default goalsSlice.reducer;
