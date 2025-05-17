require("dotenv").config(); // ensure env is loaded here too
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

module.exports = JWT_SECRET;
