import { useCallback, useState } from "react"
import { useCustomFetch } from "./useCustomFetch"
import { useWrappedRequest } from "./useWrappedRequest"

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

  return { data: userData, fetch: fetchData, loading, error: error || isError }
}

export const useGetProjectMetadata = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [metadata, setMetadata] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchById = useCallback(
    async projectId => {
      const response = await fetchWithoutCache("getProjectMetadata", {
        projectId,
      })
      try {
        const data = await response.json()
        setMetadata(data)
      } catch (error) {
        console.error(`Failed to extract metadata from response: ${error}`)
        setIsError(true)
      }
    },
    [fetchWithoutCache]
  )

  return { data: metadata, fetchById, loading, error: error || isError }
}

export const useGetProjects = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [projects, setProjects] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithoutCache("listProjects")
    try {
      const data = await response.json()
      setProjects(data.projects)
      setIsError(false)
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithoutCache])

  return { data: projects, fetchAll, loading, error: error || isError }
}

export const useGetProjectNotes = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [notes, setNotes] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchById = useCallback(
    async projectId => {
      const response = await fetchWithoutCache("getProjectNotes", {
        projectId: projectId,
      })
      try {
        const notesFile = await response.blob()
        setNotes(notesFile)
        setIsError(false)
        return notesFile
      } catch (error) {
        console.error(`Failed to extract notes file from response:\n\n${error}`)
        setIsError(true)
      }
    },
    [fetchWithoutCache]
  )

  return { data: notes, fetchById, loading, error: error || isError }
}

export const useGetProjectMedia = () => {
  const { fetchWithoutCache, loading, error } = useCustomFetch()
  const [media, setMedia] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchById = useCallback(
    async projectId => {
      const response = await fetchWithoutCache("getProjectMedia", {
        projectId: projectId,
      })
      try {
        const mediaFile = await response.blob()
        setMedia(mediaFile)
        setIsError(false)
      } catch (error) {
        console.error(`Failed to extract media file from response:\n ${error}`)
        setIsError(true)
      }
    },
    [fetchWithoutCache]
  )
  return {
    data: media,
    fetchById,
    loading: loading,
    error: error || isError,
  }
}

export const useGetProjectMediaByUrl = () => {
  const { wrappedRequest, loading, error } = useWrappedRequest()
  const [media, setMedia] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchByUrl = useCallback(async url => {
    try {
      setIsError(false)
      const response = await wrappedRequest(async () => await fetch(url))
      if (!response.ok) throw new Error("HTTP Error: Not ok")
      const data = await response.blob()
      setMedia(data)
      return data
    } catch (error) {
      console.error("Failed to fetch media by url:", error)
      setIsError(true)
    }
  }, [])

  return { data: media, fetchByUrl, loading: loading, error: error || isError }
}
