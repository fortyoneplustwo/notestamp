import { useCallback, useState } from "react"
import { getCacheKey, useCustomFetch } from "./useCustomFetch"
import { makeMetadataForSave } from "@/utils/makeMetadataForSave"

export const useSaveProject = () => {
  const { fetchWithoutCache, loading, errorNotOk } = useCustomFetch()
  const [extractionFailed, setExtractionFailed] = useState(false)

  const saveWithData = useCallback(
    async projectData => {
      try {
        const filteredMetadata = makeMetadataForSave(projectData.metadata)
        const response = await fetchWithoutCache("saveProject", {
          metadata: filteredMetadata,
          media: projectData.media,
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
        console.error(`Failed to extract projects list from response: ${error}`)
        setExtractionFailed(true)
      }
    },
    [fetchWithoutCache]
  )

  return { saveWithData, loading, error: errorNotOk || extractionFailed }
}
