import { getProjectConfig } from "@/utils/getProjectConfig"
import { customFetch } from "./custom-fetch"

export const fetchUser = async () => {
  const response = await customFetch("getUserData")
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
}

export const fetchProjects = async ({ pageParam }) => {
  const response = await customFetch("listProjects", { pageParam })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
  // NOTE: For testing
  // return new Promise(resolve => {
  //   setTimeout(
  //     () =>
  //       resolve({
  //         projects: Array(5)
  //           .fill(0)
  //           .map((_, index) => ({
  //             ...getProjectConfig("pdf"),
  //             title: `${index + 5 * pageParam}`,
  //             lastModified: new Date(
  //               Date.now() - (index + 5 * pageParam * 1000 * 60 * 60 * 24)
  //             ).toISOString(),
  //           })),
  //         nextOffset: pageParam < 5 ? pageParam + 1 : null,
  //       }),
  //     500
  //   )
  // })
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
  return response.blob()
}

export const fetchMediaByUrl = async url => {
  const response = await fetch(url)
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.blob()
}

export const fetchNotes = async projectId => {
  const response = await customFetch("getProjectNotes", { projectId })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.text()
}
