import { useCallback, useState } from 'react'
import { useCustomFetch } from './useCustomFetch';

export const useGetUserData = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [userData, setUserData] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchData = useCallback(async () => {
    const response = await fetchWithoutCache("getUserData")
    try {
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error(`Failed to extract user data from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithoutCache])

  return { data: userData, fetchData, loading, error: error || isError }
}

export const useGetProjectMetadata = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [metadata, setMetadata] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchById = useCallback(async (projectId) => {
    const response = await fetchWithoutCache("getProjectMetadata", {
      projectId
    })
    try {
      const data = await response.json()
      setMetadata(data)
    } catch (error) {
      console.error(`Failed to extract metadata from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithoutCache])

  return { data: metadata, fetchById, loading, error: error || isError };
}

export const useGetProjects = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [projects, setProjects] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithoutCache("getUserData")
    try {
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithoutCache])

  return { data: projects, fetchAll, loading, error: error || isError }
}

