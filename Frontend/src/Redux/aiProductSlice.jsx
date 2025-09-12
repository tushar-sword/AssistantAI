import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const AI_API_URL = "http://localhost:5000/api/ai";

// 👉 Fetch all AI-enhanced products
export const fetchAiProducts = createAsyncThunk(
  "aiProducts/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${AI_API_URL}/products`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI-enhanced products"
      );
    }
  }
);

// 👉 Fetch AI-enhanced product by ID
export const fetchAiProductById = createAsyncThunk(
  "aiProducts/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`${AI_API_URL}/product/${id}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI-enhanced product"
      );
    }
  }
);

// 👉 Enhance Product Images
export const enhanceProductImage = createAsyncThunk(
  "aiProducts/enhanceImage",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post(
        `${AI_API_URL}/enhance-image/${id}`,
        {},
        config
      );

      return res.data; // expected { productId, enhancedImages: [...] }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to enhance image"
      );
    }
  }
);

const aiProductSlice = createSlice({
  name: "aiProducts",
  initialState: {
    items: [],
    selectedAiProduct: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    clearAiProductState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL AI PRODUCTS
      .addCase(fetchAiProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAiProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAiProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FETCH AI PRODUCT BY ID
      .addCase(fetchAiProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAiProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAiProduct = action.payload;
      })
      .addCase(fetchAiProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ENHANCE IMAGE
      .addCase(enhanceProductImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(enhanceProductImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const { productId, enhancedImages } = action.payload;

        // ✅ Update items[]
        state.items = state.items.map((item) =>
          item.product?._id === productId
            ? {
                ...item,
                aiEnhancement: {
                  ...(item.aiEnhancement || {}),
                  enhancedImages,
                },
              }
            : item
        );

        // ✅ Update selectedAiProduct if it matches
        if (state.selectedAiProduct?.product?._id === productId) {
          state.selectedAiProduct.aiEnhancement = {
            ...(state.selectedAiProduct.aiEnhancement || {}),
            enhancedImages,
          };
        }
      })
      .addCase(enhanceProductImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { clearAiProductState } = aiProductSlice.actions;
export default aiProductSlice.reducer;
