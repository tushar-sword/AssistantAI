const dotenv = require("dotenv");
const express = require("express");

const cors = require("cors");
const connectDB = require("./config/db.js");
const userRoutes = require("./Routes/userRoutes.js");
const productRoutes = require("./Routes/productRoutes.js");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
