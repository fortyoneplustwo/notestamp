// import { useCallback, useState } from "react"
// import { useCustomFetch } from "./useCustomFetch"

// export const useRegister = () => {
//   const { fetchWithoutCache, loading, error } = useCustomFetch()
//   const [isRegistered, setIsRegistered] = useState(null)
//   const [isError, setIsError] = useState(false)

//   const registerWithCredentials = useCallback(
//     async credentials => {
//       const response = await fetchWithoutCache("register", {
//         username: credentials.email,
//         password: credentials.password,
//       })

//       try {
//         const data = await response.json()
//         setIsRegistered(data)
//       } catch (error) {
//         console.error(error)
//         setIsError(true)
//       }
//     },
//     [fetchWithoutCache]
//   )

//   return {
//     data: isRegistered,
//     error: error || isError,
//     loading,
//     registerWithCredentials,
//   }
// }

// export const useLogin = () => {
//   const { fetchWithoutCache, loading, error } = useCustomFetch()
//   const [isLoggedIn, setIsLoggedIn] = useState(null)
//   const [isError, setIsError] = useState(false)

//   const loginWithCredentials = useCallback(
//     async credentials => {
//       const response = await fetchWithoutCache("login", {
//         username: credentials.email,
//         password: credentials.password,
//       })

//       try {
//         const data = await response.json()
//         setIsLoggedIn(data)
//       } catch (error) {
//         console.error(error)
//         setIsError(true)
//       }
//     },
//     [fetchWithoutCache]
//   )

//   return {
//     data: isLoggedIn,
//     error: error || isError,
//     loading,
//     loginWithCredentials,
//   }
// }

// export const useLogout = () => {
//   const { fetchWithoutCache, loading, error } = useCustomFetch()
//   const [isLoggedOut, setIsLoggedOut] = useState(null)
//   const [isError, setIsError] = useState(false)

//   const logout = useCallback(async () => {
//     const response = await fetchWithoutCache("logout")

//     try {
//       const data = await response.json()
//       setIsLoggedOut(data)
//     } catch (error) {
//       console.error(error)
//       setIsError(true)
//     }
//   }, [fetchWithoutCache])

//   return { data: isLoggedOut, error: error || isError, loading, logout }
// }
