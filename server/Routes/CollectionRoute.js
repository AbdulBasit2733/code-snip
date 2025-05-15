const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../Middleware/Auth");
const CollectionsModel = require("../Models/Collection");
const {
  addSnippetSchema,
  createCollectionSchema,
  shareCollectionSchema,
  updateCollectionSchema,
} = require("../utils/zodSchema");

// Create a new collection
router.post("/create", AuthMiddleware, async (req, res) => {
  try {
    const parse = createCollectionSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ success: false, error: parse.error.errors });
    }

    const { name, description } = parse.data;
    // console.log(req.user);
    const ownerId = req.user._id;
    const collection = await CollectionsModel.create({
      name,
      description,
      ownerId,
    });

    res.status(201).json({ success: true, message: "Successfully created" });
  } catch (error) {
    console.log(error);
    
    res
      .status(500)
      .json({ success: false, message: "Failed to create collection" });
  }
});

// Get all collections for user (owned or shared)
router.get("/my-collections", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const collections = await CollectionsModel.find({
      $or: [{ ownerId: userId }, { sharedWith: userId }],
    }).sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch collections" });
  }
});

// Get collection by ID (with snippets)
router.get("/:id", AuthMiddleware, async (req, res) => {
  try {
    const collection = await CollectionsModel.findById(req.params.id)
      .populate("snippetIds")
      .exec();

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    const userId = req.user._id;
    const isAuthorized =
      collection.ownerId.toString() === userId.toString() ||
      collection.sharedWith.includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch collection" });
  }
});

// Update collection (name/description)
router.put("/:id", AuthMiddleware, async (req, res) => {
  try {
    const parse = updateCollectionSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ success: false, error: parse.error.errors });
    }

    const collection = await CollectionsModel.findById(req.params.id);
    if (
      !collection ||
      collection.ownerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or not found" });
    }

    const { name, description } = parse.data;
    if (name) collection.name = name;
    if (description) collection.description = description;

    await collection.save();
    res.status(200).json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// Delete a collection
router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const collection = await CollectionsModel.findById(req.params.id);

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    if (collection.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized delete" });
    }

    await collection.deleteOne();
    res.status(200).json({ success: true, message: "Collection deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete collection" });
  }
});

//  Share collection
router.post("/:id/share", AuthMiddleware, async (req, res) => {
  try {
    const parse = shareCollectionSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ success: false, error: parse.error.errors });
    }

    const { userIds } = parse.data;
    const collection = await CollectionsModel.findById(req.params.id);

    if (
      !collection ||
      collection.ownerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or not found" });
    }

    collection.sharedWith.push(...userIds);
    await collection.save();

    res.status(200).json({ success: true, message: "Collection shared" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to share collection" });
  }
});

// Add snippet to collection

router.post("/:id/add-snippet", AuthMiddleware, async (req, res) => {
  try {
    const parse = addSnippetSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ success: false, error: parse.error.errors });
    }

    const { snippetId } = parse.data;
    const collection = await CollectionsModel.findById(req.params.id);

    if (
      !collection ||
      collection.ownerId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or not found" });
    }

    if (!collection.snippetIds.includes(snippetId)) {
      collection.snippetIds.push(snippetId);
      await collection.save();
    }

    res.status(200).json({ success: true, message: "Snippet added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add snippet" });
  }
});

module.exports = router;
