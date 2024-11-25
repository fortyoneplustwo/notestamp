import { useCallback, useState } from "react"

// The point of this hook is to transform the return type of the response
// and provide the loading and error states of the request.
export const useWrappedRequest = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // This wrapper returns a response object of type Promise<Data | null>
  const wrappedRequest = useCallback(async (request) => {
    try {
      setLoading(true)
      setError(false)
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
