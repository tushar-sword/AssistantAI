const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const serverless = require("serverless-http");

// Routes
const userRoutes = require("./Routes/userRoutes.js");
const productRoutes = require("./Routes/productRoutes.js");
const aiRoutes = require("./Routes/ai.js");
const aiGetRoutes = require("./Routes/aiGet.js");
const aiContentRoutes = require("./Routes/aiContent.js"); 

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("API is running on Vercel 🚀");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", aiGetRoutes);
app.use("/api/ai-content", aiContentRoutes);

// ✅ Export instead of listen
module.exports = app;
module.exports.handler = serverless(app);
