const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      index: true,
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
    versions: [
      {
        code: String,
        editedAt: Date,
        editor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

const SnippetModel = mongoose.model("Snippet", snippetSchema);

module.exports = SnippetModel;
