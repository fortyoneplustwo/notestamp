import { SlateValueSchema } from "@/components/Editor/utils/validation"
import * as z from "zod"

export const NotesSchema = SlateValueSchema

// For when we get the stringified value
export const NotesAsStringSchema = z.string().superRefine((val, ctx) => {
  let json

  try {
    json = JSON.parse(val)
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Invalid JSON",
      fatal: true,
    })
    return z.NEVER
  }

  const result = SlateValueSchema.safeParse(json)
  if (!result.success) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid notes schema",
      params: { details: result.error.issues },
    })
  }
})

export const PageParamSchema = z.number()

export const ProjectIdSchema = z.string()

export const MediaUrlSchema = z.url()

export const MetadataSchema = z.object({
  title: z.string(),
  label: z.string(),
  type: z.string(),
  // TODO: this should really be an optional url
  src: z.string().refine(val => val === "" || z.url().parse(val)),
  mimetype: z.string(),
  lastModified: z.optional(z.string()),
})

export const ProjectsListSchema = z.object({
  projects: z.array(MetadataSchema, "Not an array"),
  nextOffset: z.nullable(z.number()),
})

export const MediaSchema = z.instanceof(Blob)

export const ProjectCreateSchema = z.object({
  metadata: MetadataSchema,
  media: z.optional(MediaSchema),
  notes: SlateValueSchema,
})

export const ProjectUpdateSchema = z.object({
  metadata: MetadataSchema,
  notes: SlateValueSchema,
})

