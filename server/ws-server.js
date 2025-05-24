require("dotenv").config();
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const cookie = require("cookie");
const CheckUser = require("./utils/checkUser");

const CodeEditsModel = require("./Models/Code"); // Updated model (1 edit per document)
const SnippetModel = require("./Models/Snippet");

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
  const cookies = cookie.parse(request.headers.cookie || "");
  console.log(cookies.token);
  
  const token = cookies.token;
  if (!token) return ws.close();

  const userId = await CheckUser(token);
  if (!userId) return ws.close();

  users.push({ userId, snippets: [], ws });
  console.log("🧑 Connected users:", users.length);

  ws.on("message", async function message(data) {
    try {
      const parsedData = JSON.parse(data.toString());
      const { type, snippetId, code, action, startLine, endLine } = parsedData;

      // Validate message structure
      if (!type || !snippetId) {
        console.warn("⚠️ Missing required fields in WebSocket message.");
        ws.send(
          JSON.stringify({
            error: "Missing required fields: type or snippetId.",
          })
        );
        return;
      }

      const user = users.find((u) => u.ws === ws);
      if (!user) return;

      const snippet = await SnippetModel.findById(snippetId);
      if (!snippet) {
        console.warn("⚠️ Snippet not found:", snippetId);
        ws.send(JSON.stringify({ error: "Snippet not found." }));
        return;
      }

      if (type === "join_snippet") {
        if (!user.snippets.includes(snippetId)) user.snippets.push(snippetId);

        snippet.liveSession.isLive = true;
        if (
          !snippet.liveSession.activeUsers.some((id) => id.equals(user.userId))
        ) {
          snippet.liveSession.activeUsers.push(user.userId);
        }
        if (!snippet.liveSession.startedAt) {
          snippet.liveSession.startedAt = new Date();
        }

        try {
          await snippet.save();
        } catch (err) {
          console.error("❌ Failed to save snippet on join:", err.message);
          ws.send(JSON.stringify({ error: "Failed to join snippet." }));
        }
      } else if (type === "leave_snippet") {
        user.snippets = user.snippets.filter((id) => id !== snippetId);

        snippet.liveSession.activeUsers =
          snippet.liveSession.activeUsers.filter(
            (id) => !id.equals(user.userId)
          );
        if (snippet.liveSession.activeUsers.length === 0) {
          snippet.liveSession.isLive = false;
          snippet.liveSession.startedAt = null;
        }

        try {
          await snippet.save();
        } catch (err) {
          console.error("❌ Failed to save snippet on leave:", err.message);
          ws.send(JSON.stringify({ error: "Failed to leave snippet." }));
        }
      } else if (type === "code_change") {
        if (
          !code ||
          !action ||
          startLine === undefined ||
          endLine === undefined
        ) {
          ws.send(JSON.stringify({ error: "Missing code change fields." }));
          return;
        }

        // Broadcast to other users
        users.forEach((u) => {
          if (u.snippets.includes(snippetId) && u.ws !== ws) {
            u.ws.send(
              JSON.stringify({
                type: "code_change",
                snippetId,
                code,
                action,
                startLine,
                endLine,
                userId: user.userId,
                timestamp: new Date(),
              })
            );
          }
        });

        try {
          await CodeEditsModel.create({
            snippetId,
            userId: user.userId,
            action,
            startLine,
            endLine,
            code,
            timestamp: new Date(),
          });
        } catch (err) {
          console.error("❌ Failed to save code edit:", err.message);
          ws.send(JSON.stringify({ error: "Code save failed." }));
        }
      } else {
        console.warn("⚠️ Unknown message type:", type);
        ws.send(JSON.stringify({ error: "Unknown message type." }));
      }
    } catch (err) {
      if (err.name === "VersionError") {
        console.error("❌ Version conflict:", err.message);
        ws.send(
          JSON.stringify({
            error: "Concurrent modification conflict. Try again.",
          })
        );
      } else if (err.name === "ValidationError") {
        console.error("❌ Validation error:", err.message);
        ws.send(
          JSON.stringify({ error: "Validation failed. Check required fields." })
        );
      } else {
        console.error("❌ WebSocket message error:", err.message);
        ws.send(JSON.stringify({ error: "Unexpected error occurred." }));
      }
    }
  });

  ws.on("close", async () => {
    console.log("❌ Disconnected", userId);
    const index = users.findIndex((u) => u.userId === userId && u.ws === ws);
    if (index !== -1) {
      const user = users[index];
      for (const snippetId of user.snippets) {
        const snippet = await SnippetModel.findById(snippetId);
        if (snippet) {
          snippet.liveSession.activeUsers =
            snippet.liveSession.activeUsers.filter(
              (id) => !id.equals(user.userId)
            );
          if (snippet.liveSession.activeUsers.length === 0) {
            snippet.liveSession.isLive = false;
            snippet.liveSession.startedAt = null;
          }
          await snippet.save();
        }
      }
      users.splice(index, 1);
    }
  });
});
