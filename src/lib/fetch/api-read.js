import { customFetch } from "./custom-fetch"

export const fetchProjects = async () => {
  const response = await customFetch("listProjects")
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
}

export const fetchMetadata = async projectId => {
  const response = await customFetch("getProjectMetadata", { projectId })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
}

export const fetchMediaById = async projectId => {
  const response = await customFetch("getProjectMedia", { projectId })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
}

export const fetchMediaByUrl = async () => {}

export const fetchNotes = async (projectId) => {
  const response = await customFetch("getProjectNotes", { projectId })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.text()
}

