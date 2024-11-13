const express = require("express");
const { body, validationResult } = require("express-validator"); // Import body and validationResult
const router = express.Router();

/* /user/test */

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        message: 'Invalid data'
    });
    }

    res.send(errors);
  }
);

module.exports = router;
