import { useCallback, useState } from "react"
import { useCustomFetch, getCacheKey } from "./useCustomFetch"

export const useUpdateProject = () => {
  const { fetchWithCache, loading, errorNotOk } = useCustomFetch()
  const [extractionFailed, setExtractionFailed] = useState(false)

  const updateWithData = useCallback(
    async projectData => {
      try {
        const response = await fetchWithCache("saveProject", {
          metadata: projectData.metadata,
          notes: projectData.notes,
        })
        if (errorNotOk) return undefined

        setExtractionFailed(false)
        const data = await response.json()

        sessionStorage.removeItem(getCacheKey("listProjects"))
        sessionStorage.setItem(
          getCacheKey("getProjectNotes", {
            projectId: projectData.metadata.title,
          }),
          JSON.stringify(projectData.notes)
        )

        return data
      } catch (error) {
        console.error(`Failed to extract message from response: ${error}`)
        setExtractionFailed(true)
      }
    },
    [fetchWithCache]
  )

  return { updateWithData, loading, error: errorNotOk || extractionFailed }
}

export const useDeleteProject = () => {
  const { fetchWithoutCache, loading, errorNotOk } = useCustomFetch()
  const [extractionFailed, setExtractionFailed] = useState(false)

  const deleteById = useCallback(
    async projectId => {
      try {
        const response = await fetchWithoutCache("deleteProject", {
          projectId,
        })
        if (errorNotOk) return undefined

        setExtractionFailed(false)
        const data = await response.json()

        sessionStorage.removeItem(getCacheKey("listProjects"))
        sessionStorage.removeItem(getCacheKey("getProjectNotes", { projectId }))

        return data
      } catch (error) {
        console.error(`Failed to extract projects list from response: ${error}`)
        setExtractionFailed(true)
        return undefined
      }
    },
    [fetchWithoutCache]
  )

  return { deleteById, loading, error: errorNotOk || extractionFailed }
}
