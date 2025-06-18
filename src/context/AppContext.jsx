import { createContext, use, useCallback, useRef, useState } from "react"

const AppContext = createContext()

export const useAppContext = () => use(AppContext)

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [syncToFileSystem, setSyncToFileSystem] = useState(false)
  const [cwd, setCwd] = useState(null)
  const [error, setError] = useState(null)
  const [triggerRefetchAllProjects, setTriggerRefetchAllProjects] =
    useState(false)
  const cache = useRef(new Map())

  const refetchAllProjects = useCallback(
    () => setTriggerRefetchAllProjects(prev => !prev),
    [setTriggerRefetchAllProjects]
  )

  return (
    <AppContext
      value={{
        user,
        setUser,
        syncToFileSystem,
        setSyncToFileSystem,
        error,
        setError,
        cache,
        cwd,
        setCwd,
        refetchAllProjects,
        triggerRefetchAllProjects,
      }}
    >
      {children}
    </AppContext>
  )
}
