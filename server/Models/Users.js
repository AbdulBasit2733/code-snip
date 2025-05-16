const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, required: false },
    collectionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
    ],
    snippetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Snippet" }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
