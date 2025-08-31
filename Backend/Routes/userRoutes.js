const express = require("express");
const router = express.Router();
const { registerUser, loginUser , getProfile } = require("../Controllers/userController");
const { protect } = require("../Middleware/authMiddleware");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

module.exports = router;
