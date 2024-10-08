import { useEffect, useState } from "react"
import { useLogin, useLogout, useRegister } from "../../../../hooks/useAuth"
import { useGetUserData } from "../../../../hooks/useReadData"
import AppToolbarButton from "../../../Button/AppToolbarButton"
import { useCustomFetch } from "../../../../hooks/useCustomFetch"
import { useAppContext } from "../../../../context/AppContext"
import { useModal } from "../../../Modal/ModalContext"

const ProfileSettings = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: userData, fetch: fetchUser } = useGetUserData()
  const { user, setUser } = useAppContext()
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

  return (
    <span className="flex ml-auto gap-4">
      {!user && (
        <AppToolbarButton 
          label={"Sign in"}
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
        />
      )}
      {user && (
        <AppToolbarButton 
          label={"Sign out"}
          disabled={isLoggingOut}
          onClick={handleLogOut}
        />
      )}
    </span>
  )
}

export default ProfileSettings
