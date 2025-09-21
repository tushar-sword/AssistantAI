import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Use Vite env variable for backend API
const CONTENT_API_URL = `${import.meta.env.VITE_API_URL}/ai-content`;

// Utility to normalize caption keys to lowercase
const normalizeKeys = (captions) => ({
  instagram: captions.Instagram || captions.instagram || [],
  facebook: captions.Facebook || captions.facebook || [],
  whatsapp: captions.WhatsApp || captions.whatsapp || [],
});

// Generate AI Content (captions for social media platforms)
export const generateContentForProduct = createAsyncThunk(
  "content/generate",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post(`${CONTENT_API_URL}/generate/${productId}`, {}, config);
      console.log("📥 [Redux] generateContentForProduct response:", res.data);

      return res.data;
    } catch (error) {
      console.error("❌ [Redux] generateContentForProduct error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to generate AI content"
      );
    }
  }
);

// Fetch AI content by product ID
export const fetchContentByProductId = createAsyncThunk(
  "content/fetchById",
  async (productId, thunkAPI) => {
    try {
      const res = await axios.get(`${CONTENT_API_URL}/product/${productId}`);
      console.log("[Redux] fetchContentByProductId response:", res.data);

      return res.data;
    } catch (error) {
      console.error("[Redux] fetchContentByProductId error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI content"
      );
    }
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState: {
    items: [], // list of all AI content objects
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
      // Generate captions
      .addCase(generateContentForProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateContentForProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { productId, captions, content } = action.payload;

        // Normalize captions from content if it exists
        const normalized = normalizeKeys(content || captions || {});

        state.items = state.items.filter((c) => c.productId !== productId);
        state.items.push({ productId, captions: normalized });
        state.selectedContent = { productId, captions: normalized };
      })
      .addCase(generateContentForProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch captions by product ID
      .addCase(fetchContentByProductId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContentByProductId.fulfilled, (state, action) => {
        state.isLoading = false;

        const { productId, captions, content } = action.payload;

        // Normalize captions from content if it exists
        const normalized = normalizeKeys(content || captions || {});

        state.selectedContent = { productId, captions: normalized };

        const exists = state.items.find((c) => c.productId === productId);
        if (!exists) {
          state.items.push({ productId, captions: normalized });
        }
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
