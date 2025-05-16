const { z } = require("zod");

const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
});

const shareCollectionSchema = z.object({
  collaborators: z.array(
    z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
      role: z.enum(["viewer", "editor"]),
    })
  ),
});

const addSnippetSchema = z.object({
  snippetId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid snippet ID"),
});

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
  shareCollectionSchema,
  addSnippetSchema,
};