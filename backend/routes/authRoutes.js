const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", optionalProtect, logout);

module.exports = router;
