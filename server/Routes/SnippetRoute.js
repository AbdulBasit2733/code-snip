const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../Middleware/Auth");
const SnippetModel = require("../Models/Snippet");
const { default: mongoose } = require("mongoose");

router.post("/create-snippet", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, code, language, collectionId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const snippet = await SnippetModel.create({
      title,
      content: code,
      language,
      authorId: userId,
      collectionId,
    });

    res.status(201).json({ success: true, snippet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/my-snippets", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const snippets = await SnippetModel.find({
      $or: [{ authorId: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 });

    res.status(200).json({ success: true, snippets });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch snippets" });
  }
});

router.get("/:id", AuthMiddleware, async (req, res) => {
  try {
    const snippet = await SnippetModel.findById(req.params.id);

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    const isAuthorized =
      snippet.authorId.toString() === userId.toString() ||
      snippet.collaborators.includes(userId);

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching snippet" });
  }
});

router.put("/:id", AuthMiddleware, async (req, res) => {
  try {
    const { title, code, language, isLive } = req.body;
    const snippet = await SnippetModel.findById(req.params.id);

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    const isAuthorized =
      snippet.authorId.toString() === userId.toString() ||
      snippet.collaborators.includes(userId);

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized update" });
    }

    snippet.title = title ?? snippet.title;
    snippet.content = code ?? snippet.content;
    snippet.language = language ?? snippet.language;
    snippet.isLive = isLive ?? snippet.isLive;

    await snippet.save();

    res.status(200).json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const snippet = await SnippetModel.findById(req.params.id);

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    if (snippet.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can delete" });
    }

    await snippet.deleteOne();
    res.status(200).json({ success: true, message: "Snippet deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

router.post("/:id/share", AuthMiddleware, async (req, res) => {
  try {
    const { collaboratorIds } = req.body;
    console.log(collaboratorIds);

    // Validate each ID
    const validCollaborators = collaboratorIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const snippet = await SnippetModel.findById(req.params.id);

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    if (snippet.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can share" });
    }

    snippet.collaborators.push(...validCollaborators);
    await snippet.save();

    res.status(200).json({ success: true, message: "Snippet shared", snippet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Sharing failed" });
  }
});

module.exports = router;
