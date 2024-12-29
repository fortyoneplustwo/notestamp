import { useCallback, useState } from 'react'
import { useCustomFetch } from './useCustomFetch';

export const useSaveProject = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [hasError, setHasError] = useState(false)

  const saveWithData = useCallback(async (projectData) => {
    const response = await fetchWithoutCache("saveProject", {
      metadata: projectData.metadata,
      media: projectData.media,
      notes: projectData.notes,
    })
    try {
      setHasError(false)
      await response.json()
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setHasError(true)
    }
  }, [fetchWithoutCache])

  return { saveWithData, loading, error: error || hasError }
}
