import { useCallback, useState } from "react"
import { useCustomFetch } from "./useCustomFetch"

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
  const { fetchWithCache, loading, error } = useCustomFetch()
  const [projects, setProjects] = useState(null)
  const [isError, setIsError] = useState(false)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache("listProjects")
    try {
      const data = await response.json()
      setProjects(data.projects)
      setIsError(false)
    } catch (error) {
      console.error(`Failed to extract projects list from response: ${error}`)
      setIsError(true)
    }
  }, [fetchWithCache])

  return { data: projects, fetchAll, loading, error: error || isError }
}

export const useGetProjectNotes = () => {
  const { fetchWithCache, loading, error } = useCustomFetch()
  const [notes, setNotes] = useState("")
  const [isError, setIsError] = useState(false)

  const fetchById = useCallback(
    async projectId => {
      try {
        const response = await fetchWithCache("getProjectNotes", {
          projectId: projectId,
        })
        if (error) return undefined

        const notesFile = await response.blob()
        const readFile = file =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = error =>
              reject(new Error("Error reading notes file:", error))
            reader.readAsText(file)
          })
        const notes = await readFile(notesFile)

        setIsError(false)
        setNotes(notes)
        return notes
      } catch (error) {
        console.error("Failed to extract notes file from response:", error)
        setIsError(true)
      }
    },
    [fetchWithCache]
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

  return { data: media, fetchById, loading, error: error || isError }
}
