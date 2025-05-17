const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../Middleware/Auth");
const CollectionModel = require("../Models/Collection");
const UserModel = require("../Models/Users");
const {
  createCollectionSchema,
  updateCollectionSchema,
} = require("../utils/validations");

// Create a new collection
router.post("/create", AuthMiddleware, async (req, res) => {
  try {
    const parseResult = createCollectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ success: false, errors: parseResult.error.errors });
    }

    const { name, description, snippetIds } = parseResult.data;
    const ownerId = req.user._id;

    const existingCollection = await CollectionModel.findOne({ name, ownerId });
    if (existingCollection) {
      return res
        .status(400)
        .json({ success: false, message: "Collection name already used." });
    }

    const newCollection = await CollectionModel.create({
      name,
      description,
      snippetIds,
      ownerId,
    });

    await UserModel.findByIdAndUpdate(ownerId, {
      $push: { collectionIds: newCollection._id },
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection: newCollection,
    });
  } catch (error) {
    console.error("Create Collection Error:", error);
    res.status(500).json({ success: false, message: "Failed to create collection" });
  }
});

// Get all collections for the authenticated user
router.get("/my-collections", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const collections = await CollectionModel.find({ ownerId: userId }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error("Fetch Collections Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch collections" });
  }
});

// Get collection by ID
router.get("/:id", AuthMiddleware, async (req, res) => {
  try {
    const collection = await CollectionModel.findById(req.params.id).populate("snippetIds").exec();
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    const isOwner = collection.ownerId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    console.error("Get Collection Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch collection" });
  }
});

// Update collection
router.put("/:id", AuthMiddleware, async (req, res) => {
  try {
    const parseResult = updateCollectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.errors });
    }

    const collection = await CollectionModel.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    if (collection.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this collection" });
    }

    const { name, description } = parseResult.data;
    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;

    await collection.save();
    res.status(200).json({ success: true, collection });
  } catch (error) {
    console.error("Update Collection Error:", error);
    res.status(500).json({ success: false, message: "Failed to update collection" });
  }
});

// Delete collection
router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const collection = await CollectionModel.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    if (collection.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this collection" });
    }

    await collection.deleteOne();
    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: { collectionIds: collection._id },
    });

    res.status(200).json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Delete Collection Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete collection" });
  }
});

// Add snippet to collection
router.post("/:id/add-snippet", AuthMiddleware, async (req, res) => {
  try {
    const { snippetId } = req.body;
    const collection = await CollectionModel.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    if (collection.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this collection" });
    }

    if (!collection.snippetIds.includes(snippetId)) {
      collection.snippetIds.push(snippetId);
      await collection.save();
    }

    res.status(200).json({ success: true, message: "Snippet added to collection" });
  } catch (error) {
    console.error("Add Snippet Error:", error);
    res.status(500).json({ success: false, message: "Failed to add snippet" });
  }
});

module.exports = router;
