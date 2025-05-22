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
    },
    snippetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Snippet" }],
  },
  { timestamps: true }
);


const CollectionModel = mongoose.model("Collection", collectionSchema);
module.exports = CollectionModel;
