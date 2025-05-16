require("dotenv").config();

const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config/config");
const CheckUser = require("./utils/checkUser");

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = CheckUser(token)
  
  if(!userId){
    ws.close()
  }
 

  ws.on("message", function message(data) {
    ws.send("PONG", name);
  });
});
