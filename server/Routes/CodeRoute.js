const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AuthMiddleware = require("../Middleware/Auth");
const SnippetModel = require("../Models/Snippet");
const CodeEditsModel = require("../Models/Code");

router.get("/code/:snippetId", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.snippetId;

    // Validate snippetId
    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid snippet ID",
      });
    }

    // Check permission
    const snippet = await SnippetModel.findOne(
      {
        _id: snippetId,
        $or: [
          { authorId: userId },
          { "collaborators.user": userId }
        ],
      },
      { _id: 1 }
    ).lean();

    if (!snippet) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a collaborator or owner.",
      });
    }

    // Fetch all code edits for this snippet
    const codeEdits = await CodeEditsModel.find({ snippetId })
      .sort({ createdAt: 1 })
      .select("userId action startLine endLine code timestamp")
      .populate("userId", "name email") // optional: get user name/email
      .lean();

    res.status(200).json({
      success: true,
      data: codeEdits,
    });
  } catch (error) {
    console.error("❌ Error fetching code edits:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


module.exports = router;
