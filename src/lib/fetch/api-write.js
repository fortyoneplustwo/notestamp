import { customFetch } from "./custom-fetch"
import { ProjectCreateSchema } from "./schemas"

export const createProject = async data => {
  const validated = ProjectCreateSchema.parse(data)
  const response = await customFetch("saveProject", {
    metadata: validated.metadata,
    media: validated.media,
    notes: validated.notes,
  })
  if (!response.ok) {
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
