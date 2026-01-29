import { customFetch } from "./custom-fetch"
import { ProjectUpdateSchema } from "./schemas"

export const updateProject = async (data) => {
  const validated = ProjectUpdateSchema.parse(data)
  const response = await customFetch("saveProject", {
    metadata: validated.metadata,
    notes: validated.notes,
  })
  if (!response.ok) {
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
