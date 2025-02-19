require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// ✅ Secure CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Rate Limiting for Security
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts, try again later" }
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

// ✅ Register Route
app.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });

    res.json({ message: "User registered successfully" });
  }
);

// ✅ Login Route
app.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });
  res.json({ token });
});

// ✅ Refresh Token Route
app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ token: newToken });
  });
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});

// ✅ Get Encryption Key
app.get("/get-key", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    res.json({ encryptionKey: process.env.ENCRYPTION_KEY });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
