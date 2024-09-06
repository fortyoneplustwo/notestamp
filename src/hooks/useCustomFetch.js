import { useCallback } from "react"
import { apiFetch } from "../utils/fetch"
import { useWrappedRequest } from "./useWrappedRequest"

export const useCustomFetch = () => {
  const { loading, error, wrappedRequest } = useWrappedRequest()

  const fetchWithoutCache = useCallback(async (endpoint, params) => {
    wrappedRequest(async () => await apiFetch(endpoint, params))
  }, [wrappedRequest])

  return { fetchWithoutCache, loading, error }
} 


