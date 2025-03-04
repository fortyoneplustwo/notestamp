import React, { useState, useRef, useEffect } from 'react'
import { TextEditor, useEditor } from './components/Editor/TextEditor'
import { EventEmitter } from './utils/EventEmitter'
import WelcomeMessage from './components/Screens/Welcome/WelcomeMessage'
import Dashboard from './components/Screens/Dashboard/Dashboard'
import MediaRenderer from './components/MediaRenderer/MediaRenderer'
import { ProjectProvider } from './context/ProjectContext'
import LeftPane from './components/Containers/LeftPane'
import RightPane from './components/Containers/RightPane'
import AppBar from './components/AppBar/AppBar'
import { useGetProjectMetadata, useGetProjectNotes, useGetUserData } from './hooks/useReadData'
import { ModalProvider } from './context/ModalContext'
import { useAppContext } from './context/AppContext'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeProvider'
import { defaultMediaConfig, tourSteps } from './config'
import { myMediaComponents } from './components/MediaRenderer/config'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import "./index.css"

const App = () => {
  const mediaRendererRef = useRef(null)
  const [isProjectOpen, setIsProjectOpen] = useState(null)
  const [currProjectMetadata, setCurrProjectMetadata] = useState(null)
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const { editor } = useEditor()
  const { data: userData  } = useGetUserData()
  const { user, setUser, syncToFileSystem } = useAppContext()
  const { 
    data: metadata,
    fetchById: fetchProjectById,
    loading: loadingMetadata,
    error: errorFetchingMetadata,
  } = useGetProjectMetadata()
  const { 
    data: fetchedNotes, 
    fetchById: fetchNotesById, 
    loading: loadingNotes,
    error: errorFetchingNotes
  } = useGetProjectNotes()

  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  useEffect(() => {
    if (metadata) {
      setCurrProjectMetadata(metadata)
      fetchNotesById(metadata.title)
    }
  }, [metadata, fetchNotesById])

 useEffect(() => {
    if (!fetchedNotes) return
    const reader = new FileReader();
    reader.onload = () => editor.setContent(reader.result)
    reader.onerror = (error) => console.error(`Error reading notes file:\n${error}`)
    reader.readAsText(fetchedNotes)
  }, [fetchedNotes])

  useEffect(() => {
    if (!loadingNotes && errorFetchingNotes) {
      // handle error
    }
  }, [loadingNotes, errorFetchingNotes])
  
  useEffect(() => {
    if (!loadingMetadata && errorFetchingMetadata) {
      // handle error
    }
  }, [loadingMetadata, errorFetchingMetadata])

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

  const handleOpenProject = (projectId) => {
    fetchProjectById(projectId)
    setIsProjectOpen(true)
  }

  const handleGetMediaState = dateStampRequested =>
    mediaRendererRef.current?.getState?.(dateStampRequested) ??
      { label: null, value: null }

  const handleSeekMedia = (_, stampValue) => {
    mediaRendererRef.current?.setState?.(stampValue)
  }
  
  EventEmitter.subscribe('open-media-with-src', data => { 
    setCurrProjectMetadata({
      label: 'Audio Player',
      type: data.type,
      src: data.src
    })
    setIsProjectOpen(true)
  })

  const handleOnBeginTour = () => setRun(true)


  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      setStepIndex(0)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="grid grid-rows-[auto,1fr] h-screen bg-[#f5f5f7] dark:bg-mybgprim">
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
                    loading={loadingMetadata}
                    ref={(node) => mediaRendererRef.current = node} 
                  />
                ) : (user || syncToFileSystem) ? (
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
        steps={tourSteps} 
        run={run} 
        callback={handleJoyrideCallback} 
        spotlightClicks={true}
        hideCloseButton={true}
        disableOverlayClose={true}
        showProgress={true}
      />
    </ThemeProvider>
  )
}

export default App 

