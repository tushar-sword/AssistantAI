const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Example protected route
// const { protect } = require("./Middleware/sellerPanelauthMidWar");
// app.use("/api/products", protect, require("./routes/productInfo.routes"));

// ✅ Export handler for Vercel
module.exports = (req, res) => app(req, res);
