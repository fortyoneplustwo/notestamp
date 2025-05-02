import { createContext, use, useRef, useState } from "react"

const AppContext = createContext()

export const useAppContext = () => use(AppContext)

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [syncToFileSystem, setSyncToFileSystem] = useState(false)
  const [cwd, setCwd] = useState(null)
  const [error, setError] = useState(null)
  const cache = useRef(new Map())

  return (
    (<AppContext value={{ 
      user,
      setUser, 
      syncToFileSystem,
      setSyncToFileSystem,
      error, 
      setError, 
      cache, 
      cwd,
      setCwd
    }}>
      { children }
    </AppContext>)
  );
}
