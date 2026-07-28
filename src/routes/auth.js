const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const API_USER = {
  id: "api_user_1",
  email: "api@laslindas.local",
  password: "LasLindas2026!",
  role: "admin",
  name: "API User"
};

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "ValidationError",
      message: "email and password are required"
    });
  }

  if (email !== API_USER.email || password !== API_USER.password) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    {
      sub: API_USER.id,
      email: API_USER.email,
      role: API_USER.role
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    user: {
      id: API_USER.id,
      email: API_USER.email,
      role: API_USER.role,
      name: API_USER.name
    }
  });
});

module.exports = {
  authRouter: router
};
