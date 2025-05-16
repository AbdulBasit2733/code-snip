const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config/config");

function CheckUser(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded || !decoded.id) {
    ws.close();
    return null;
  }

  return decoded.id;
}

module.exports = CheckUser;
