import { customFetch } from "./custom-fetch"

// TODO: rename to updateNotes
// then have a separate updateMetadata for things like rename
export const updateProject = async (data) => {
  const response = await customFetch("saveProject", {
    metadata: data.metadata,
    notes: data.notes,
  })
  
  if (!response.ok) {
    throw Error("Network error: Response not ok")
  }
  return response.json()
}
