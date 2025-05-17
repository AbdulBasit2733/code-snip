require("dotenv").config();
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");

const CheckUser = require("./utils/checkUser");
const CodeModel = require("./Models/Code");
const SnippetModel = require("./Models/Snippet");
const UserModel = require("./Models/Users");

const wss = new WebSocketServer({ port: 8080 });
const users = [];
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
wss.on("connection", async function connection(ws, request) {
  const url = request.url;
  if (!url) return ws.close();

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = await CheckUser(token);
  if (!userId) return ws.close();

  users.push({ userId, snippets: [], ws });
  console.log("users", users);

  ws.on("message", async function message(data) {
    try {
      const parsedData = JSON.parse(data.toString());
      const user = users.find((x) => x.ws === ws);
      if (!user) return;

      const { type, snippetId, code } = parsedData;
      console.log(parsedData);

      if (!snippetId) return; // snippetId is needed for all relevant types

      const snippet = await SnippetModel.findOne({
        _id: snippetId,
      });
      if (!snippet) return;

      if (type === "join_snippet") {
        if (!user.snippets.includes(snippetId)) {
          user.snippets.push(snippetId);
        }

        // Update snippet liveSession
        snippet.liveSession.isLive = true;

        const isAlreadyActive = snippet.liveSession.activeUsers.some((id) =>
          id.equals(user.userId)
        );
        if (!isAlreadyActive) {
          snippet.liveSession.activeUsers.push(user.userId);
        }

        if (!snippet.liveSession.startedAt) {
          snippet.liveSession.startedAt = new Date();
        }

        await snippet.save();
      } else if (type === "leave_snippet") {
        user.snippets = user.snippets.filter((id) => id !== snippetId);

        // Remove user from activeUsers
        snippet.liveSession.activeUsers =
          snippet.liveSession.activeUsers.filter(
            (id) => !id.equals(user.userId)
          );

        // If no active users left, mark liveSession as not live and clear startedAt
        if (snippet.liveSession.activeUsers.length === 0) {
          snippet.liveSession.isLive = false;
          snippet.liveSession.startedAt = null;
        }

        await snippet.save();
      } else if (type === "code_change") {
        // Broadcast code change to other users in the snippet

        users.forEach((u) => {
          if (u.snippets.includes(snippetId) && u.ws !== ws) {
            u.ws.send(
              JSON.stringify({
                type: "code_change",
                code,
                snippetId,
              })
            );
          }
        });
        console.log("code_change", users);

        // Save code edit to the database
        let codeDoc = await CodeModel.findOne({ snippetId });
        if (!codeDoc) {
          codeDoc = await CodeModel.create({
            snippetId,
            edits: [
              {
                userId: user.userId,
                code,
                timestamp: new Date(),
              },
            ],
          });
        } else {
          codeDoc.edits.push({
            userId: user.userId,
            code,
            timestamp: new Date(),
          });
          await codeDoc.save();
        }
      } else {
        console.warn("Unknown message type:", type);
      }
    } catch (err) {
      console.error("WebSocket message error:", err.message);
    }
  });

  ws.on("close", async () => {
    console.log("Disconnected", userId);
  });
});
