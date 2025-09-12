import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/products/";

// 👉 Add Product
export const addProduct = createAsyncThunk(
  "products/add",
  async (productData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post(API_URL, productData, config);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add product"
      );
    }
  }
);

// 👉 Fetch All Products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// 👉 Fetch Single Product
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(API_URL + id);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selectedProduct: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    clearProductState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ADD PRODUCT
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FETCH ALL
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { clearProductState } = productSlice.actions;
export default productSlice.reducer;
