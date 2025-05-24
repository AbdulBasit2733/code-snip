const mongoose = require("mongoose");

const CodeEditSchema = new mongoose.Schema(
  {
    snippetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["insert", "delete", "update"],
      required: true,
    },
    startLine: Number,
    endLine: Number,
    code: String, // the actual code inserted/updated
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CodeEditsModel = mongoose.model("Code", CodeEditSchema);
module.exports = CodeEditsModel;
