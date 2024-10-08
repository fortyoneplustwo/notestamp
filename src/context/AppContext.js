import { createContext, useContext, useRef, useState } from "react"

const AppContext = createContext()

export const useAppContext = () => useContext(AppContext)

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const cache = useRef(new Map())

  return (
    <AppContext.Provider value={{ user, setUser, error, setError, cache }}>
      { children }
    </AppContext.Provider>
  )
}
