const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { z } = require("zod");

const AuthMiddleware = require("../Middleware/Auth");
const SnippetModel = require("../Models/Snippet");
const UserModel = require("../Models/Users");
const CollectionModel = require("../Models/Collection");

// Zod schemas
const CreateSnippetSchema = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  code: z.string().min(1),
  collectionId: z.string().optional(),
  collaboratorIds: z.array(z.string().min(1)).optional(),
});

const UpdateSnippetSchema = z.object({
  title: z.string().optional(),
  code: z.string().optional(),
  language: z.string().optional(),
});

const ShareSnippetSchema = z.object({
  collaboratorIds: z.array(z.string().min(1)),
});

// Helper to check snippet access
async function checkSnippetAccess(snippet, userId) {
  if (!snippet) return false;
  if (snippet.authorId.toString() === userId.toString()) return true;
  if (snippet.collaborators.some((c) => c.user.toString() === userId.toString()))
    return true;
  return false;
}

// Create Snippet
router.post("/create-snippet", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const parsed = CreateSnippetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { title, code, language, collectionId, collaboratorIds = [] } = parsed.data;

    // Prevent duplicate collaborator IDs
    const uniqueCollaborators = [...new Set(collaboratorIds)];

    const collaborators = uniqueCollaborators.map((id) => ({
      user: id,
      permission: "edit", // default permission
    }));

    const snippet = await SnippetModel.create({
      title,
      code,
      language,
      authorId: userId,
      collectionId: collectionId || null,
      collaborators,
    });

    // Update user's snippetIds
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { snippetIds: snippet._id } });

    // If collectionId provided, add snippetId to that collection
    if (collectionId) {
      await CollectionModel.findByIdAndUpdate(collectionId, { $addToSet: { snippetIds: snippet._id } });
    }

    res.status(201).json({ success: true, message: "Snippet created successfully", snippet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get My Snippets (author or collaborator)
router.get("/my-snippets", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const snippets = await SnippetModel.find({
      $or: [{ authorId: userId }, { "collaborators.user": userId }],
    }).sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: snippets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch snippets" });
  }
});

// Get Snippet by ID with access check
router.get("/:id", AuthMiddleware, async (req, res) => {
  try {
    const snippet = await SnippetModel.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    if (!(await checkSnippetAccess(snippet, userId))) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching snippet" });
  }
});

// Update Snippet
router.put("/:id", AuthMiddleware, async (req, res) => {
  try {
    const parsed = UpdateSnippetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const snippet = await SnippetModel.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    const userId = req.user._id;
    if (!(await checkSnippetAccess(snippet, userId))) {
      return res.status(403).json({ success: false, message: "Unauthorized update" });
    }

    Object.assign(snippet, parsed.data);
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
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    if (snippet.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can delete" });
    }

    // Remove snippetId from user's snippetIds
    await UserModel.findByIdAndUpdate(req.user._id, { $pull: { snippetIds: snippet._id } });

    // Remove snippetId from collection's snippetIds if assigned
    if (snippet.collectionId) {
      await CollectionModel.findByIdAndUpdate(snippet.collectionId, { $pull: { snippetIds: snippet._id } });
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
    const parsed = ShareSnippetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { collaboratorIds } = parsed.data;

    const snippet = await SnippetModel.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    if (snippet.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can share" });
    }

    // Prevent duplicates
    const existingIds = snippet.collaborators.map((c) => c.user.toString());
    collaboratorIds.forEach((id) => {
      if (!existingIds.includes(id)) {
        snippet.collaborators.push({ user: id, permission: "edit" });
      }
    });

    await snippet.save();

    res.status(200).json({ success: true, message: "Snippet shared", snippet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Sharing failed" });
  }
});

module.exports = router;
