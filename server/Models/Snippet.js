// models/Snippet.js
const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    language: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    liveSession: {
      isLive: { type: Boolean, default: false },
      activeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      startedAt: { type: Date },
    },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "edit",
        },
      },
    ],
  },
  { timestamps: true }
);

const SnippetModel = mongoose.model("Snippet", snippetSchema);
module.exports = SnippetModel;
