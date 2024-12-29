import { useCallback, useState } from "react"

export const useGetDirHandle = () => {
  const [dirHandle, setDirHandle] = useState(null)
  const [error, setError] = useState(false)

  const verifyPermission = useCallback(async (fileHandle, permissions) => {
    const options = {};
    if (permissions.includes("readwrite")) {
      options.mode = 'readwrite';
    }
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  }, [])

  const getDirHandle = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" })
      const permissionGranted = await verifyPermission(handle, ["readwrite"])
      if (permissionGranted) {
        setDirHandle(handle)
        setError(false)
      }
    } catch (e) {
      console.error(e)
      setDirHandle(null)
      setError(true)
    }
  }, [verifyPermission])

  return { dirHandle, getDirHandle, error }
}
