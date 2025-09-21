// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/authSlice";
import productReducer from "../Redux/productSlice";

import aiProductReducer from "../Redux/aiProductSlice";
import contentReducer from "../Redux/contentSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    
    aiProducts: aiProductReducer,
     content: contentReducer, 

  },
});

export default store;
