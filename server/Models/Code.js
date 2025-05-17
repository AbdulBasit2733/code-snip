const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema(
  {
    snippetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
    },
    edits: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        code: String, // The portion of code added/edited
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
CodeSchema.index({ snippetId: 1 });

const CodeModel = mongoose.model("Code", CodeSchema);
module.exports = CodeModel;
