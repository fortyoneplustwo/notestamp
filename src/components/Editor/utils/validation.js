import * as z from "zod"

/**
 * Validation of the Editor's content
 *
 * Leaf = Text
 * Preleaf = StampedElement | Branch | Postbranch
 * Postbranch = ListItem
 * Branch = Paragraph | BulletedList | NumberedList
 */

export const LeafSchema = z.object({
  text: z.string(),
  bold: z.optional(z.boolean()),
  italic: z.optional(z.boolean()),
  underline: z.optional(z.boolean()),
  code: z.optional(z.boolean()),
})

export const PreLeafSchema = z.object({
  type: z.literal("stamped-item"),
  label: z.string(),
  value: z.any(),
  children: z.array(LeafSchema),
})

export const PostBranchSchema = z.object({
  type: z.literal("list-item"),
  children: z.array(z.union([PreLeafSchema, LeafSchema])),
})

export const BranchSchema = z.object({
  type: z.enum(["paragraph", "bulleted-list", "numbered-list"]),
  children: z.array(z.union([PostBranchSchema, PreLeafSchema, LeafSchema])),
})

// TODO: thoroughly test this
export const SlateValueSchema = z.array(BranchSchema)

