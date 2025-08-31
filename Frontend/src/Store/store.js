// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/authSlice";
import productReducer from "../Redux/productSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
  },
});

export default store;
