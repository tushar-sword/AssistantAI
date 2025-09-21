// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/authSlice";
import productReducer from "../Redux/productSlice";
<<<<<<< Updated upstream
=======
import aiProductReducer from "../Redux/aiProductSlice";
import contentReducer from "../Redux/contentSlice";
>>>>>>> Stashed changes

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
<<<<<<< Updated upstream
=======
    aiProducts: aiProductReducer,
     content: contentReducer, 
>>>>>>> Stashed changes
  },
});

export default store;
