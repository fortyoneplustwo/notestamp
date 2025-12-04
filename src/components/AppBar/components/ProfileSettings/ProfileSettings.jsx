import { useEffect, useState } from "react"
import { useLogin, useLogout, useRegister } from "@/hooks/useAuth"
import { useGetUserData } from "@/hooks/useReadData"
import { useCustomFetch } from "@/hooks/useCustomFetch"
import { useAppContext } from "@/context/AppContext"
import { useModal } from "@/context/ModalContext"
import { Toggle } from "./components/Toggle.jsx"
import { User } from "lucide-react"
import { ModeToggle } from "./components/ModeToggle"
import { useGetDirHandle } from "@/hooks/useFileSystem"
import { Button } from "@/components/ui/button"
import { useLocation, useNavigate, useParams } from "@tanstack/react-router"

const ProfileSettings = () => {
  // eslint-disable-next-line no-unused-vars
  const [isLogginIn, setIsLoggingIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isFileSyncChecked, setIsFileSyncChecked] = useState(false)
  const { data: userData, fetch: fetchUser } = useGetUserData()
  const { user, setUser, setSyncToFileSystem, setCwd } = useAppContext()
  const {
    data: isLoggedIn,
    loginWithCredentials,
    loading: loadingLogIn,
    error: errorLoggingIn,
  } = useLogin()
  const {
    data: isLoggedOut,
    logout,
    loading: loadingLogOut,
    error: errorLoggingOut,
  } = useLogout()
  const { registerWithCredentials } = useRegister()
  const { getDirHandle } = useGetDirHandle()
  const { clearCache } = useCustomFetch()
  const { openModal, closeModal } = useModal()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams({ strict: false })

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
  }, [isLoggedIn, isLoggedOut, fetchUser, setUser, clearCache])

  useEffect(() => {
    if (!loadingLogIn) {
      setIsLoggingIn(false)
      if (errorLoggingIn) {
        // toast.error("Error logging in")
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

  const handleToggleFileSync = async checked => {
    if (checked) {
      try {
        const handle = await getDirHandle()
        setCwd(handle)
        setSyncToFileSystem(true)
        // navigate to /local
        navigate({ to: "/local/workspace" + location.pathname })
      } catch (error) {
        console.error(error)
        setIsFileSyncChecked(false)
        // display error
      }
    } else {
      setCwd(null)
      setSyncToFileSystem(false)
      const path = location.pathname
      if (path.startsWith("/local/workspace")) {
        const suffix = path.slice(`/local/workspace`.length)
        navigate({ to: suffix.startsWith("/") ? suffix : `/${suffix}` })
      }
    }
  }

  return (
    <span className="flex ml-auto gap-4">
      <span className="flex items-center" data-tour-id="file-sync-switch">
        <Toggle
          onToggle={checked => {
            setIsFileSyncChecked(checked)
            handleToggleFileSync(checked)
          }}
          isChecked={isFileSyncChecked}
        >
          File Sync
        </Toggle>
      </span>
      <ModeToggle />
      {!user && // eslint-disable-line no-constant-binary-expression
        false && (
          <Button
            variant="default"
            size="xs"
            onClick={() =>
              openModal("loginModal", {
                onClose: closeModal,
                onLogin: handleLogIn,
                onRegister: () => {
                  openModal("registerModal", {
                    onClose: closeModal,
                    onRegister: handleRegister,
                  })
                },
              })
            }
          >
            <User size={16} />
            Sign in
          </Button>
        )}
      {user && (
        <Button
          variant="secondary"
          disabled={isLoggingOut}
          onClick={handleLogOut}
        >
          Sign out
        </Button>
      )}
    </span>
  )
}

export default ProfileSettings
