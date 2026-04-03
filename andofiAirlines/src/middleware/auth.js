const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "laslindas-dev-secret";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing bearer token"
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token"
    });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
