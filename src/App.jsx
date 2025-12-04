import React, { useState, useRef, useEffect } from "react"
import { TextEditor } from "./components/Editor/TextEditor"
import { EventEmitter } from "./utils/EventEmitter"
import { ProjectProvider } from "./context/ProjectContext"
import LeftPane from "./components/Containers/LeftPane"
import RightPane from "./components/Containers/RightPane"
import AppBar from "./components/AppBar/AppBar"
import { useGetProjectNotes, useGetUserData } from "./hooks/useReadData"
import { ModalProvider } from "./context/ModalContext"
import { useAppContext } from "./context/AppContext"
import { Toaster } from "sonner"
import { ThemeProvider } from "./context/ThemeProvider"
import { defaultMediaConfig } from "./config"
import { myMediaComponents } from "./components/MediaRenderer/config"
import { useCreateEditor } from "./components/Editor/hooks/useCreateEditor"
import { useContent } from "./components/Editor/hooks/useContent"
import "./index.css"
import { toast } from "sonner"
import { createRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { rootRoute } from "./router"

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_appLayout",
  component: App,
})

export function App() {
  const mediaRendererRef = useRef(null)
  const [isProjectOpen, setIsProjectOpen] = useState(null)
  const [currProjectMetadata, setCurrProjectMetadata] = useState(null)

  const navigate = useNavigate()
  const { editor } = useCreateEditor()
  const { setContent } = useContent()
  const { data: userData } = useGetUserData()
  const { user, setUser, syncToFileSystem } = useAppContext()
  const { fetchById: fetchNotesById, error: errorFetchingNotes } =
    useGetProjectNotes()

  // useEffect(() => {
  //   if (isProjectOpen) {
  //     // go to media renderer
  //   } else if (user) {
  //     // go to protected dashboard
  //   } else if (syncToFileSystem) {
  //     // go to local dashboard
  //     navigate({ to: "/local" })
  //   } else {
  //     navigate({ to: "/" })
  //   }
  // }, [navigate, isProjectOpen, user, syncToFileSystem])

  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  const handleOpenNewProject = metadata => {
    setIsProjectOpen(() => {
      setCurrProjectMetadata({
        ...metadata,
        src: "",
        title: "",
        mimetype: "",
      })
      return true
    })
  }

  const handleOpenProject = async metadata => {
    const config = defaultMediaConfig.find(
      config => config.type === metadata.type
    )
    setCurrProjectMetadata({ ...config, ...metadata })
    setIsProjectOpen(true)
    const notes = await fetchNotesById(metadata?.title)
    if (errorFetchingNotes || !notes) {
      toast.error("Failed to fetch notes")
    }
    setContent(editor, notes)
  }

  const handleGetMediaState = dateStampRequested => {
    const state = mediaRendererRef.current?.getState?.(dateStampRequested)
    if (!state) return null
    if (state.label === null || state.label === undefined) return null
    if (state.value === null || state.value === undefined) return null
    return state
  }

  const handleSeekMedia = (_, stampValue) => {
    mediaRendererRef.current?.setState?.(stampValue)
  }

  EventEmitter.subscribe("open-media-with-src", data => {
    setCurrProjectMetadata({
      ...data,
      label: "Audio Player",
      type: data.type,
      src: data.src,
    })
    setIsProjectOpen(true)
  })

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="grid grid-rows-[auto_1fr] h-screen bg-sidebar-accent dark:bg-mybgprim">
        <ProjectProvider currProjectConfig={currProjectMetadata}>
          <ModalProvider>
            <header className="flex row-span-1 bg-transparent pt-2 px-2">
              <AppBar navItems={defaultMediaConfig.concat(myMediaComponents)} />
            </header>
            <main className="row-span-2 grid grid-cols-2">
              <LeftPane>
                {/* isProjectOpen ? (
                  <MediaRenderer
                    metadata={currProjectMetadata}
                    ref={node => (mediaRendererRef.current = node)}
                  />
                ) : user || syncToFileSystem ? (
                  <Dashboard onOpenProject={handleOpenProject} />
                ) : (
                  <WelcomeMessage onClickTourButton={handleOnBeginTour} />
                ) */}
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
        </ProjectProvider>
      </div>
    </ThemeProvider>
  )
}
