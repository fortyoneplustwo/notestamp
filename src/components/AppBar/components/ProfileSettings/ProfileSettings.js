import { useEffect, useState } from "react"
import { useLogin, useLogout, useRegister } from "../../../../hooks/useAuth"
import { useGetUserData } from "../../../../hooks/useReadData"
import Button from "../../../Button/Button"
import { useCustomFetch } from "../../../../hooks/useCustomFetch"
import { useAppContext } from "../../../../context/AppContext"
import { useModal } from "../../../../context/ModalContext"
import ToggleButton from "../../../Button/ToggleButton"

const ProfileSettings = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: userData, fetch: fetchUser } = useGetUserData()
  const { user, setUser, setSyncToFileSystem, setCwd } = useAppContext()
  const { data: isLoggedIn, loginWithCredentials, loading: loadingLogIn, error: errorLoggingIn } = useLogin()
  const { data: isLoggedOut, logout, loading: loadingLogOut, error: errorLoggingOut } = useLogout()
  const { registerWithCredentials } = useRegister()
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
      if (errorLoggingIn) {
        // handle error
      }
      setIsLoggingIn(false)
    }
  }, [loadingLogIn, errorLoggingIn, fetchUser])

  useEffect(() => {
    if (!loadingLogOut) {
      if (errorLoggingOut) {
        // handle error
      }
      setIsLoggingOut(false)
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

  const handleToggleSyncToFileSystem = () => 
    setSyncToFileSystem(active => {
      if (active) {
        setCwd(null)
      }
      return !active
    })

  return (
    <span className="flex ml-auto gap-4">
      <ToggleButton 
        onClick={handleToggleSyncToFileSystem} 
        icon={"sync"}
        style={{ border: "none" }}
      >
        Sync
      </ToggleButton>
      {!user && false && (
        <Button 
          disabled={isLoggingIn}
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
          Sign in 
        </Button>
      )}
      {user && (
        <Button 
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
