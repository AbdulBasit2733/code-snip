const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    snippetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Snippet" }],
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CollectionsModel = mongoose.model("Collection", collectionSchema);

module.exports = CollectionsModel;
