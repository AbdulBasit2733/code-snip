const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const z = require("zod");
const UserModel = require("../Models/Users");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/config");
const AuthMiddleware = require("../Middleware/Auth");
const { createUserSchema, loginUserSchema } = require("../utils/validations");


router.post("/register", async (req, res) => {
  try {
    const parsedData = createUserSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parsedData.error.errors,
      });
    }

    const { username, email, password } = parsedData.data;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    // 1. Validate input using Zod
    const parsedData = loginUserSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parsedData.error.errors,
      });
    }

    const { email, password } = parsedData.data;

    // 2. Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // 5. Send token as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only over HTTPS in production
      sameSite: "Lax", // can also use "Strict" for more protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // cookie available throughout site
    });

    // 6. Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/check-auth", AuthMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    data: req.user,
  });
});

module.exports = router;

module.exports = router;
