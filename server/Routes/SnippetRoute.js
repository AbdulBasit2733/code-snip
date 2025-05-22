const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AuthMiddleware = require("../Middleware/Auth");

const SnippetModel = require("../Models/Snippet");
const UserModel = require("../Models/Users");
const CollectionModel = require("../Models/Collection");

const { createSnippetSchema } = require("../utils/validations"); // Assuming all schemas are exported from Validators/index.js

// Helper to check snippet access
async function checkSnippetAccess(snippet, userId) {
  if (!snippet) return false;
  if (snippet.authorId.toString() === userId.toString()) return true;
  if (
    snippet.collaborators.some((c) => c.user.toString() === userId.toString())
  )
    return true;
  return false;
}

// Create Snippet
router.post("/create-snippet", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const parsed = createSnippetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.errors });
    }

    const { title, language, collectionId, collaborators = [] } = parsed.data;

    const uniqueCollaborators = [
      ...new Map(collaborators.map((c) => [c.user, c])).values(),
    ];

    const snippet = await SnippetModel.create({
      title,
      language,
      authorId: userId,
      collectionId: collectionId || null,
      collaborators: uniqueCollaborators,
    });

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { snippetIds: snippet._id },
    });

    if (collectionId) {
      await CollectionModel.findByIdAndUpdate(collectionId, {
        $addToSet: { snippetIds: snippet._id },
      });
    }

    res
      .status(201)
      .json({ success: true, message: "Snippet created", snippet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get My Snippets
router.get("/my-snippets", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const snippets = await SnippetModel.find({
      $or: [{ authorId: userId }, { "collaborators.user": userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("collectionId")
      .populate("collaborators.user", "-password")
      .lean();
    const data = snippets.map((snippet) => {
      const { collectionId, ...rest } = snippet;
      return { ...rest, collection: collectionId };
    });
    console.log(data);

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch snippets" });
  }
});

// Get Snippet by ID
router.get("/:id", AuthMiddleware, async (req, res) => {
  try {
    const snippet = await SnippetModel.findById(req.params.id);
    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    if (!(await checkSnippetAccess(snippet, userId))) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching snippet" });
  }
});

// Update Snippet
router.put("/:id", AuthMiddleware, async (req, res) => {
  try {
    const snippet = await SnippetModel.findById(req.params.id);
    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    if (!(await checkSnippetAccess(snippet, userId))) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized update" });
    }

    const updates = req.body;
    Object.assign(snippet, updates);
    await snippet.save();

    res.status(200).json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// Delete Snippet
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

    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: { snippetIds: snippet._id },
    });

    if (snippet.collectionId) {
      await CollectionModel.findByIdAndUpdate(snippet.collectionId, {
        $pull: { snippetIds: snippet._id },
      });
    }

    await snippet.deleteOne();
    res.status(200).json({ success: true, message: "Snippet deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// Share Snippet
router.post("/:id/share", AuthMiddleware, async (req, res) => {
  try {
    const { collaborators } = req.body;
    const snippet = await SnippetModel.findById(req.params.id);

    if (!snippet?.title || !snippet?.language) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    if (snippet.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only the owner can share this snippet",
        });
    }

    const existingMap = new Map(
      snippet.collaborators.map((c) => [c.user.toString(), c])
    );

    collaborators.forEach(({ id, permission }) => {
      if (existingMap.has(id)) {
        existingMap.get(id).permission = permission;
      } else {
        snippet.collaborators.push({ user: id, permission });
      }
    });

    await snippet.save();
    res.json({ success: true, message: "Invited" });
  } catch (error) {
    console.error("Share snippet error:", error);
    res.status(500).json({ success: false, message: "Sharing failed" });
  }
});

//leave snippet

router.post('/:id/leave', AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.id;

    const snippet = await SnippetModel.findById(snippetId);
    
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    const isCollaborator = snippet.collaborators.some(
      (collab) => collab.user.toString() === userId.toString()
    );

    if (!isCollaborator) {
      return res.status(400).json({
        success: false,
        message: "You are not a collaborator of this snippet",
      });
    }

    snippet.collaborators = snippet.collaborators.filter(
      (collab) => collab.user.toString() !== userId.toString()
    );

    await snippet.save();

    return res.status(200).json({
      success: true,
      message: "You have successfully left the snippet",
    });
  } catch (error) {
    console.error("Leave snippet error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


module.exports = router;
