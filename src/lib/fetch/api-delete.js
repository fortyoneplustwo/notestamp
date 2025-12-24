import { customFetch } from "./custom-fetch"

export const deleteProject = async (projectId) => {
  const response = customFetch("deleteProject", { projectId })

  if (!response.ok) {
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
