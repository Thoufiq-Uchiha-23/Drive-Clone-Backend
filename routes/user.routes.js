const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* Register Route */
router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email")
      .isLength({ min: 13 }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }

    const { email, username, password } = req.body;

    try {
      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        email,
        username: username.toLowerCase(),
        password: hashPassword,
      });

      console.log("User registered successfully:", {
        username,
        email,
        passwordBeforeHashing: password,
        passwordAfterHashing: hashPassword,
      });

      res.json(newUser);
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/* Login Route */
router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation errors during login:", errors.array());
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }

    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({
        username: username.toLowerCase(),
      });

      console.log("Queried user during login:", user);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Username or password is incorrect" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Username or password is incorrect" });
      }

      /* Generate JWT */
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET environment variable is missing!");
        return res.status(500).json({ message: "Internal server error" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET
      );

      console.log("Generated JWT token:", token);

      res.cookie("token", token);

      res.send("Logged in");

      res.json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
