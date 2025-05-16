// models/Collection.js
const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    snippetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Snippet" }],
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
  },
  { timestamps: true }
);

collectionSchema.index({ name: 1, ownerId: 1 }, { unique: true });

const CollectionsModel = mongoose.model("Collection", collectionSchema);
module.exports = CollectionsModel;
