import { useCallback, useState } from "react"

// This wrapper returns a response object of type Promise<Data | null>
// as well as the loading and error states of the request.
export const useWrappedRequest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const wrappedRequest = useCallback(async (request) => {
    try {
      setLoading(true)
      const response = await request()
      if (!response.ok) {
        throw new Error("Response not ok")
      }
      return response
    } catch (error) {
      setError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, wrappedRequest }
}
