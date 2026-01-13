import { customFetch } from "./custom-fetch"
import { ProjectIdSchema } from "./schemas"

export const deleteProject = async projectId => {
  const validatedProjectId = ProjectIdSchema.parse(projectId)
  const response = await customFetch("deleteProject", {
    projectId: validatedProjectId,
  })
  if (!response.ok) {
    console.log(response)
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
