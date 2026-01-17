import { customFetch } from "./custom-fetch"
import { localFetch } from "./local-fetch"
import {
  MediaSchema,
  MediaUrlSchema,
  MetadataSchema,
  PageParamSchema,
  ProjectIdSchema,
  ProjectsListSchema,
  NotesAsStringSchema,
} from "./schemas"

export const fetchUser = async () => {
  const response = await customFetch("getUserData")
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  return response.json()
}

export const fetchProjects = async ({
  pageParam,
  searchParam,
  columnFilters,
  sorting,
}) => {
  const validatedPageParam = PageParamSchema.parse(pageParam)
  const response = await customFetch("listProjects", {
    pageParam: validatedPageParam,
    searchParam,
    columnFilters,
    sorting,
  })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  const data = await response.json()
  return ProjectsListSchema.parse(data)

  // NOTE: For testing
  // return new Promise(resolve => {
  //  setTimeout(
  //    () =>
  //      resolve({
  //        projects: Array(5)
  //          .fill(0)
  //          .map((_, index) => ({
  //            ...getProjectConfig("pdf"),
  //            title: `${index + 5 * pageParam}`,
  //            lastModified: new Date(
  //              Date.now() - (index + 5 * pageParam * 1000 * 60 * 60 * 24)
  //            ).toISOString(),
  //          })),
  //        nextOffset: pageParam < 5 ? pageParam + 1 : null,
  //      }),
  //    500
  //  )
  // })
}

export const fetchDirHandle = async ({ id, cwd }) => {
  return new Promise(resolve => setTimeout(() => resolve("test"), 2000))
}

export const fetchMetadata = async projectId => {
  const validatedProjectId = ProjectIdSchema.parse(projectId)
  const response = await customFetch("getProjectMetadata", {
    projectId: validatedProjectId,
  })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  const data = await response.json()
  return MetadataSchema.parse(data)
}

export const fetchMediaById = async projectId => {
  const validatedProjectId = ProjectIdSchema.parse(projectId)
  const response = await customFetch("getProjectMedia", {
    projectId: validatedProjectId,
  })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  const data = await response.blob()
  return MediaSchema.parse(data)
}

export const fetchMediaByUrl = async url => {
  const validatedMediaUrl = MediaUrlSchema.parse(url)
  const response = await fetch(validatedMediaUrl)
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  const data = await response.blob()
  return MediaSchema.parse(data)
}

export const fetchNotes = async projectId => {
  const validatedProjectId = ProjectIdSchema.parse(projectId)
  const response = await customFetch("getProjectNotes", {
    projectId: validatedProjectId,
  })
  if (!response.ok) {
    throw Error(`Network error: Response not ok`)
  }
  const data = await response.text()
  return NotesAsStringSchema.parse(data)
}
