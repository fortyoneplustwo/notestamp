import React from "react"
import { TextEditor } from "./components/Editor/TextEditor"
import { mediaRef } from "./context/ProjectContext"
import LeftPane from "./components/Containers/LeftPane"
import RightPane from "./components/Containers/RightPane"
import AppBar from "./components/AppBar/AppBar"
import { ModalProvider } from "./context/ModalContext"
// import { useAppContext } from "./context/AppContext"
import { Toaster } from "sonner"
import { ThemeProvider } from "./context/ThemeProvider"
import { defaultMediaConfig } from "./config"
import { myMediaComponents } from "./components/MediaRenderer/config"
import { useCreateEditor } from "./components/Editor/hooks/useCreateEditor"
import "./index.css"
import { createRoute, Outlet } from "@tanstack/react-router"
import { rootRoute } from "./router"

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_appLayout",
  component: App,
})

export function App() {
  const { editor } = useCreateEditor()
  // const { data: userData } = useGetUserData()
  // const { user, setUser, syncToFileSystem } = useAppContext()

  // useEffect(() => {
  //   setUser(userData)
  // }, [userData, setUser])

  const handleGetMediaState = dateStampRequested => {
    const state = mediaRef.current?.getState?.(dateStampRequested)
    if (!state) return null
    if (state.label === null || state.label === undefined) return null
    if (state.value === null || state.value === undefined) return null
    return state
  }

  const handleSeekMedia = (_, stampValue) => {
    mediaRef.current?.setState?.(stampValue)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="grid grid-rows-[auto_1fr] h-screen bg-sidebar-accent dark:bg-mybgprim">
        <ModalProvider>
          <header className="flex row-span-1 bg-transparent pt-2 px-2">
            <AppBar navItems={defaultMediaConfig.concat(myMediaComponents)} />
          </header>
          <main className="row-span-2 grid grid-cols-2">
            <LeftPane>
              <Outlet />
            </LeftPane>
            <RightPane>
              <TextEditor
                editor={editor}
                onStampInsert={handleGetMediaState}
                onStampClick={handleSeekMedia}
              />
            </RightPane>
          </main>
          <Toaster position="bottom-left" richColors />
        </ModalProvider>
      </div>
    </ThemeProvider>
  )
}
