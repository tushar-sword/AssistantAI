// src/Redux/contentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Corrected API base
const CONTENT_API_URL = "http://localhost:5000/api/ai-content";

// 👉 Generate AI Content for a Product
export const generateContentForProduct = createAsyncThunk(
  "content/generate",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const res = await axios.post(
        `${CONTENT_API_URL}/generate/${productId}`,
        {},
        config
      );

      console.log("📥 [Redux] generateContentForProduct response:", res.data);

      // In debug mode, backend returns:
      // { success: true, message: "Route hit successfully!", product: {...} }
      return res.data;
    } catch (error) {
      console.error("❌ [Redux] generateContentForProduct error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to generate AI content"
      );
    }
  }
);

// 👉 Fetch content by productId
export const fetchContentByProductId = createAsyncThunk(
  "content/fetchById",
  async (productId, thunkAPI) => {
    try {
      const res = await axios.get(`${CONTENT_API_URL}/product/${productId}`);
      console.log("📥 [Redux] fetchContentByProductId response:", res.data);
      return res.data; // { productId, content }
    } catch (error) {
      console.error("❌ [Redux] fetchContentByProductId error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI content"
      );
    }
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState: {
    items: [], // list of all content objects
    selectedContent: null, // currently viewed product content
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    clearContentState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Content
      .addCase(generateContentForProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateContentForProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { productId, content, product } = action.payload;

        if (product) {
          // 🔹 In debug mode, just store product info
          state.selectedContent = { productId: product.id, debugProduct: product };
        } else if (productId && content) {
          // 🔹 In real AI mode
          state.items = state.items.filter((c) => c.productId !== productId);
          state.items.push({ productId, content });
          state.selectedContent = { productId, content };
        }
      })
      .addCase(generateContentForProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch by ID
      .addCase(fetchContentByProductId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContentByProductId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContent = action.payload;
      })
      .addCase(fetchContentByProductId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { clearContentState } = contentSlice.actions;
export default contentSlice.reducer;
