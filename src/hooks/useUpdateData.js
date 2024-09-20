import { useCallback, useState } from 'react'
import { useCustomFetch } from './useCustomFetch';

export const useUpdateProject = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [isError, setIsError] = useState(false)

  const updateWithData = useCallback(async (projectData) => {
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

  return { updateWithData, loading, error: error || isError }
}

export const useDeleteProject = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [hasError, setHasError] = useState(false)

  const deleteById = useCallback(async (projectId) => {
    const response = fetchWithoutCache("saveProject", {
      projectId,
    })
    try {
      setHasError(false)
      await response.json()
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setHasError(true)
    }
  }, [fetchWithoutCache])

  return { deleteById, loading, error: error || hasError }
}
