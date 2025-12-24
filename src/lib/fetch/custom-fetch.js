import { useAppContext } from "@/context/AppContext"
import { localFetch } from "./local-fetch"
import { remoteFetch } from "./remote-fetch"

export const customFetch = async (endpoint, params) => {
  const { syncToFileSystem, cwd } = useAppContext.getState()

  if (syncToFileSystem) {
    return await localFetch(endpoint, {
      ...(params || {}),
      cwd: cwd,
    })
  } else {
    return await remoteFetch(endpoint, params)
  }
}
