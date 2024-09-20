import { useCallback, useState } from 'react'
import { useCustomFetch } from './useCustomFetch';

export const useRegister = () => {
  const { fetchWitoutCache, loading, error } = useCustomFetch()
  const [isError, setIsError] = useState(false)

  const registerWithCredentials = useCallback(async (credentials) => {
    const response = await fetchWitoutCache("register", {
      username: credentials.email,
      password: credentials.password,
    })

    try {
      await response.json()
    } catch (error) {
      console.error(error)
      setIsError(true)
    }
  }, [fetchWitoutCache])

  return { error: error || isError, loading, registerWithCredentials }
}

export const useLogin = () => {
  const { fetchWitoutCache, loading, error } = useCustomFetch()
  const [isError, setIsError] = useState(false)

  const loginWithCredentials = useCallback(async (credentials) => {
    const response = await fetchWitoutCache("login", {
      username: credentials.email,
      password: credentials.password,
    })

    try {
      await response.json()
    } catch (error) {
      console.error(error)
      setIsError(true)
    }
  }, [fetchWitoutCache])

  return { error: error || isError, loading, loginWithCredentials }
}

export const useLogout = () => {
  const { fetchWitoutCache, loading, error } = useCustomFetch()
  const [isError, setIsError] = useState(false)

  const logout = useCallback(async () => {
    const response = await fetchWitoutCache("logout")

    try {
      await response.json()
    } catch (error) {
      console.error(error)
      setIsError(true)
    }
  }, [fetchWitoutCache])

  return { error: error || isError, loading, logout }
}
