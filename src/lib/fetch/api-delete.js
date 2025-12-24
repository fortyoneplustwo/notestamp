import { customFetch } from "./custom-fetch"

export const deleteProject = async (projectId) => {
  const response = await customFetch("deleteProject", { projectId })

  if (!response.ok) {
    console.log(response)
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
