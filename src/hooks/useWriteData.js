import { useCallback, useState } from 'react'
import { useCustomFetch } from './useCustomFetch';

export const useSaveProject = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [isError, setIsError] = useState(false)

  const saveWithData = useCallback(async (projectData) => {
    const response = await fetchWithoutCache("saveProject", {
      metadata: projectData.metadata,
      media: projectData.media,
      notes: projectData.notes,
    })
    try {
      await response.json()
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithoutCache])

  return { saveWithData, loading, error: error || isError }
}
