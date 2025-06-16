import React, { useState, useRef, useEffect } from "react"
import { TextEditor } from "./components/Editor/TextEditor"
import { EventEmitter } from "./utils/EventEmitter"
import WelcomeMessage from "./components/Screens/Welcome/WelcomeMessage"
import Dashboard from "./components/Screens/Dashboard/Dashboard"
import MediaRenderer from "./components/MediaRenderer/MediaRenderer"
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
import { Joyride, Tooltip, useJoyride } from "./features/guided-tour"
import "./index.css"

const App = () => {
  const mediaRendererRef = useRef(null)
  const [isProjectOpen, setIsProjectOpen] = useState(null)
  const [currProjectMetadata, setCurrProjectMetadata] = useState(null)

  const { editor } = useCreateEditor()
  const { setContent } = useContent()
  const { data: userData } = useGetUserData()
  const { user, setUser, syncToFileSystem } = useAppContext()
  const { steps, run, stepIndex, handleOnBeginTour, handleJoyrideCallback } =
    useJoyride()
  const {
    data: fetchedNotes,
    fetchById: fetchNotesById,
    loading: loadingNotes,
    error: errorFetchingNotes,
  } = useGetProjectNotes()

  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  useEffect(() => {
    if (!fetchedNotes) return
    const reader = new FileReader()
    reader.onload = () => setContent(editor, reader.result)
    reader.onerror = error =>
      console.error(`Error reading notes file:\n${error}`)
    reader.readAsText(fetchedNotes)
  }, [fetchedNotes])

  useEffect(() => {
    if (!loadingNotes && errorFetchingNotes) {
      // handle error
    }
  }, [loadingNotes, errorFetchingNotes])

  const handleOpenNewProject = (label, type) => {
    setIsProjectOpen(() => {
      setCurrProjectMetadata({
        label: label,
        type: type,
        src: "",
        title: "",
        mimetype: "",
      })
      return true
    })
  }

  const handleOpenProject = metadata => {
    fetchNotesById(metadata?.title)
    setCurrProjectMetadata(metadata)
    setIsProjectOpen(true)
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
        <ProjectProvider>
          <ModalProvider>
            <header className="flex row-span-1 bg-transparent pt-2 px-2">
              <AppBar
                showToolbar={isProjectOpen}
                onCloseProject={() => {
                  setIsProjectOpen(false)
                  setCurrProjectMetadata(null)
                }}
                navItems={defaultMediaConfig.concat(myMediaComponents)}
                onNavItemClick={handleOpenNewProject}
                metadata={currProjectMetadata}
              />
            </header>
            <main className="row-span-2 grid grid-cols-2">
              <LeftPane>
                {isProjectOpen ? (
                  <MediaRenderer
                    metadata={currProjectMetadata}
                    ref={node => (mediaRendererRef.current = node)}
                  />
                ) : user || syncToFileSystem ? (
                  <Dashboard onOpenProject={handleOpenProject} />
                ) : (
                  <WelcomeMessage onClickTourButton={handleOnBeginTour} />
                )}
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
      <Joyride
        locale={{ close: "Next" }}
        stepIndex={stepIndex}
        steps={steps}
        run={run}
        callback={handleJoyrideCallback}
        spotlightClicks={true}
        hideCloseButton={true}
        disableOverlayClose={true}
        showProgress={true}
        tooltipComponent={Tooltip}
        floaterProps={{ hideArrow: true }}
      />
    </ThemeProvider>
  )
}

export default App
