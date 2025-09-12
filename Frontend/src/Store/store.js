// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/authSlice";
import productReducer from "../Redux/productSlice";
import aiProductReducer from "../Redux/aiProductSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    aiProducts: aiProductReducer,
  },
});

export default store;
