const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AuthMiddleware = require("../Middleware/Auth");
const CodeModel = require("../Models/Code");
const SnippetModel = require("../Models/Snippet");

router.get("/code/:snippetId", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.snippetId;

    // Validate snippetId format
    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid snippet ID",
      });
    }

    // Check if user is a collaborator or the owner
    const snippet = await SnippetModel.findOne(
      {
        _id: snippetId,
        $or: [
          { authorId: userId },
          { "collaborators.user": userId }
        ],
      },
      { _id: 1 } // project only _id to reduce payload
    ).lean();

    if (!snippet) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a collaborator or owner.",
      });
    }

    // Fetch code document (with edits history)
    const codeDoc = await CodeModel.findOne(
      { snippetId },
      { edits: 1 }
    ).lean();

    if (!codeDoc || !Array.isArray(codeDoc.edits) || codeDoc.edits.length === 0) {
      return res.status(200).json({
        success: true,
        edits: [], // return empty array if no edits
      });
    }

    // Format edits
    const formattedEdits = codeDoc.edits.map((edit) => ({
      code: edit.code,
      userId: edit.userId,
      timestamp: edit.timestamp,
    }));

    res.status(200).json({
      success: true,
      data: formattedEdits,
    });
  } catch (error) {
    console.error("❌ Error fetching code history:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
