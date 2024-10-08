import { useCallback } from "react"
import { useAppContext } from "../context/AppContext"
import { apiFetch } from "../utils/fetch"
import { useWrappedRequest } from "./useWrappedRequest"

export const useCustomFetch = () => {
  const { cache } = useAppContext()
  const { loading, error, wrappedRequest } = useWrappedRequest()

  const fetchWithoutCache = useCallback(async (endpoint, params) => (
    wrappedRequest(async () => {
      const data = await apiFetch(endpoint, params)
      return data
    })
  ), [wrappedRequest])

  const fetchWithCache = useCallback(async (endpoint, params) => (
    wrappedRequest(async () => {
      const cacheKey = getCacheKey(endpoint, params)
      const cacheResponse = cache?.current?.get(cacheKey)

      if (cacheResponse) {
        return JSON.parse(cacheResponse)
      }

      const result = await apiFetch(endpoint, params)
      cache?.current?.set(cacheKey, JSON.stringify(result))
      return result
    }) 
  ), [cache, wrappedRequest])

  const clearCache = useCallback(() => {
    if (!cache?.current) {
      return
    }

    cache.current = new Map()
  }, [cache])

  const clearCacheByEndpoint = useCallback((endpoints) => {
    if (!cache?.current) {
      return
    }

    const cacheKeys = Array.from(cache.current.keys)
    
    for (const key of cacheKeys) {
      const shouldClear = endpoints.some((e) => key.startsWith(e))

      if (shouldClear) {
        cache.current.delete(key)
      }
    }
  }, [cache])

  return { fetchWithCache, fetchWithoutCache, clearCache, clearCacheByEndpoint, loading, error }
} 

const getCacheKey = (endpoint, params) => {
      return `${endpoint}${params ? `@${JSON.stringify(params)}` : ""}`
}
