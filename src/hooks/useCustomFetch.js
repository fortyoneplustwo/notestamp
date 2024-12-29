import { useCallback } from "react"
import { useAppContext } from "../context/AppContext"
import { backendFetch } from "../utils/backendFetch"
import { fsFetch } from "../utils/fsFetch"
import { useWrappedRequest } from "./useWrappedRequest"

export const useCustomFetch = () => {
  const { cache, syncToFileSystem, cwd } = useAppContext()
  const { loading, error, wrappedRequest } = useWrappedRequest()

  const fetchDispatch = useCallback(async (endpoint, params) => {
    // Synchronized local dir takes precedence over a user session
    if (syncToFileSystem) {
      return await fsFetch(endpoint, {
        ...(params || {}),
        cwd: cwd,
      })
    } else {
      return await backendFetch(endpoint, params)
    }
  }, [cwd, syncToFileSystem])

  const fetchWithoutCache = useCallback(async (endpoint, params) => (
    wrappedRequest(async () => {
      const data = await fetchDispatch(endpoint, params)
      return data
    })
  ), [wrappedRequest, fetchDispatch])

  const fetchWithCache = useCallback(async (endpoint, params) => (
    wrappedRequest(async () => {
      const cacheKey = getCacheKey(endpoint, params)
      const cacheResponse = cache?.current?.get(cacheKey)

      if (cacheResponse) {
        return JSON.parse(cacheResponse)
      }

      const result = await fetchDispatch(endpoint, params)
      result.ok && cache.current?.set(cacheKey, JSON.stringify(result))
      return result
    }) 
  ), [cache, wrappedRequest, fetchDispatch])

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
