import { useEffect, useState } from "react"
import { useLogin, useLogout, useRegister } from "@/hooks/useAuth"
import { useGetUserData } from "@/hooks/useReadData"
import { AppBarButton, DefaultButton } from "@/components/Button/Button"
import { useCustomFetch } from "@/hooks/useCustomFetch"
import { useAppContext } from "@/context/AppContext"
import { useModal } from "@/context/ModalContext"
import { Toggle } from "@/components/Button/Toggle"
import { toast } from "react-toastify"
import { User } from "lucide-react"
import { ModeToggle } from "@/components/Button/ModeToggle"
import { useGetDirHandle } from "@/hooks/useFileSystem"

const ProfileSettings = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isFileSyncChecked, setIsFileSyncChecked] = useState(false)
  const { data: userData, fetch: fetchUser } = useGetUserData()
  const { user, setUser, setSyncToFileSystem, setCwd } = useAppContext()
  const { data: isLoggedIn, loginWithCredentials, loading: loadingLogIn, error: errorLoggingIn } = useLogin()
  const { data: isLoggedOut, logout, loading: loadingLogOut, error: errorLoggingOut } = useLogout()
  const { registerWithCredentials } = useRegister()
  const { getDirHandle } = useGetDirHandle()
  const { clearCache } = useCustomFetch()
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  useEffect(() => {
    if (isLoggedIn) {
      fetchUser()
    }
    if (isLoggedOut) {
      setUser(null)
      clearCache()
    }
  },[isLoggedIn, isLoggedOut, fetchUser, setUser, clearCache])

  useEffect(() => {
    if (!loadingLogIn) {
      setIsLoggingIn(false)
      if (errorLoggingIn) {
        toast.error("Error logging in")
        return
      }
    }
  }, [loadingLogIn, errorLoggingIn, fetchUser])

  useEffect(() => {
    if (!loadingLogOut) {
      setIsLoggingOut(false)
      if (errorLoggingOut) {
        // handle error
      }
    }
  }, [loadingLogOut, errorLoggingOut])

  const handleRegister = (email, password) => {
   registerWithCredentials({
      email: email,
      password: password,
    }) 
    closeModal()
  }

  const handleLogIn = (email, password) => {
    setIsLoggingIn(true)
    loginWithCredentials({
      email: email,
      password: password,
    })
    closeModal()
  }

  const handleLogOut = () => {
    setIsLoggingOut(true)
    clearCache()
    logout()
  }

  const handleToggleFileSync = async (checked) => {
    if (checked) {
      try {
        const handle = await getDirHandle()
        setCwd(handle)
        setSyncToFileSystem(true)
      } catch (error) {
        setIsFileSyncChecked(false)
      }
    } else {
      setCwd(null)
      setSyncToFileSystem(false)
    }
  }

  return (
    <span className="flex ml-auto gap-4">
      <span className="file-sync-switch">
        <Toggle
          onToggle={(checked) => {
            setIsFileSyncChecked(checked)
            handleToggleFileSync(checked)
          }}
          isChecked={isFileSyncChecked}
        >
          File Sync
        </Toggle>
      </span>
      <ModeToggle />
      {!user && false && (
        <AppBarButton 
          variant="default"
          onClick={() => openModal("loginModal", { 
            onClose: closeModal,
            onLogin: handleLogIn,
            onRegister: () => {
              openModal("registerModal", {
                onClose: closeModal,
                onRegister: handleRegister,
              })
            }
          })}
        >
          <User size={16} />
          Sign in
        </AppBarButton>
      )}
      {user && (
        <DefaultButton 
          disabled={isLoggingOut}
          onClick={handleLogOut}
        >
          Sign out 
        </DefaultButton>
      )}
    </span>
  )
}

export default ProfileSettings
