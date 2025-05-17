const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/config");

async function CheckUser(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}

module.exports = CheckUser;
