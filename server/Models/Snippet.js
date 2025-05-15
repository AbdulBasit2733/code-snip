const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    language: { type: String, required: true },
    content: { type: String, required: true },
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
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isLive: { type: Boolean, default: false },
    executionResult: {
      output: String,
      error: String,
      timestamp: Date,
    },
  },
  { timestamps: true }
);

const SnippetModel = mongoose.model("Snippet", snippetSchema);

module.exports = SnippetModel;
