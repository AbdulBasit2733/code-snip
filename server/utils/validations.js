const { z } = require("zod");

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  avatarUrl: z.string().url().optional(),
});
const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  snippetIds: z.array(z.string()).optional(),
});

const createSnippetSchema = z.object({
  title: z.string(),
  language: z.string(),
  collectionId: z.string().optional(),
  collaborators: z
    .array(
      z.object({
        user: z.string(),
        permission: z.enum(["view", "edit"]).optional(),
      })
    )
    .optional(),
});

const createCodeSchema = z.object({
  snippetId: z.string(),
  edits: z
    .array(
      z.object({
        userId: z.string(),
        code: z.string(),
        timestamp: z.date().optional(),
      })
    )
    .optional(),
});

const shareSchema = z.object({
  collaboratorIds: z.array(z.string().min(1)),
  permission: z.enum(["view", "edit"]),
});

module.exports = {
  createCollectionSchema,
  createUserSchema,
  createSnippetSchema,
  createCodeSchema,
  loginUserSchema,
  shareSchema
};
