const WebSocket = require("ws");
const SnippetModel = require("./Models/Snippet");

const snippetQueues = new Map(); // { snippetId: { code, timer } }
const SAVE_DELAY = 2000; // 2 seconds debounce

function scheduleSave(snippetId, code) {
  if (snippetQueues.has(snippetId)) {
    clearTimeout(snippetQueues.get(snippetId).timer);
  }

  const timer = setTimeout(async () => {
    try {
      await SnippetModel.findByIdAndUpdate(snippetId, {
        content: code,
        updatedAt: new Date(),
      });
      console.log(`Snippet ${snippetId} saved to DB`);
    } catch (err) {
      console.error(`Error saving snippet ${snippetId}:`, err);
    }
  }, SAVE_DELAY);

  snippetQueues.set(snippetId, { code, timer });
}

function attachWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("New WebSocket connection");
    socket.snippetId = null;

    socket.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        const { type, snippetId, code } = data;

        if (type === "join") {
          socket.snippetId = snippetId;
          console.log(`Client joined snippet ${snippetId}`);
        }

        if (type === "code-change") {
          if (!snippetId || !code) return;

          scheduleSave(snippetId, code);

          // Broadcast code to other clients editing same snippet
          wss.clients.forEach((client) => {
            if (
              client !== socket &&
              client.readyState === WebSocket.OPEN &&
              client.snippetId === snippetId
            ) {
              client.send(JSON.stringify({ type: "code-update", code }));
            }
          });
        }
      } catch (err) {
        console.error("Invalid WebSocket message format", err);
      }
    });

    socket.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
}

module.exports = { attachWebSocket };
