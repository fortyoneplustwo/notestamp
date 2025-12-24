import { customFetch } from "./custom-fetch"

export const createProject = async data => {
  const response = await customFetch("saveProject", {
    metadata: data.metadata,
    media: data.media,
    notes: data.notes,
  })

  if (!response.ok) {
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
