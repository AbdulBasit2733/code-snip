const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/config");
const UserModel = require("../Models/Users");

const AuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log(token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded);
    
    const user = await UserModel.findOne({
      _id:decoded.id
    }).select('-password')
    req.user = user;
    next();
  } catch (error) {
    console.error("AuthMiddleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = AuthMiddleware;
