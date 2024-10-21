import React, { useState, useRef, useEffect } from 'react'
import TextEditor from './components/Editor/TextEditor'
import { EventEmitter } from './components/EventEmitter.js'
import WelcomeMessage from './components/Screens/Welcome/WelcomeMessage'
import Dashboard from './components/Screens/Dashboard/Dashboard'
import MediaRenderer from './components/MediaRenderer/MediaRenderer'
import { myMediaComponents as customMediaComponents } from './components/MediaRenderer/config'
import { ProjectProvider } from './context/ProjectContext'
import LeftPane from './components/LeftPane'
import RightPane from './components/RightPane'
import AppBar from './components/AppBar/AppBar'
import { useGetProjectMetadata, useGetProjectNotes, useGetUserData } from './hooks/useReadData'
import { ModalProvider } from './context/ModalContext'
import { useAppContext } from './context/AppContext'

const App = () => {
  const mediaRendererRef = useRef(null)
  const textEditorRef = useRef(null)
  const [isProjectOpen, setIsProjectOpen] = useState(null)
  const [currProjectMetadata, setCurrProjectMetadata] = useState(null)
  const [mediaComponents, setMediaComponents] = useState([
    { label: 'YouTube Player', type: 'youtube', path: './YoutubePlayer.js' },
    { label: 'Audio Player', type: 'audio', path: './AudioPlayer.js' },
    { label: 'Sound Recorder', type: 'recorder', path: './AudioRecorder.js' },
    { label: 'Pdf Reader', type: 'pdf', path: './PdfReader.js' }
  ])

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

  /**
    * Add custom media components on initial render 
    */
  useEffect(() => {
    setMediaComponents(m => {
      return [...m, ...customMediaComponents]
    })
  }, [])

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
    reader.onload = () => textEditorRef.current?.setContent(reader.result)
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

  const handleGetMediaState = dateStampRequested => { 
    if (mediaRendererRef.current) {
      const stampData = mediaRendererRef.current.getState(dateStampRequested)
      return stampData ? stampData : { label: null, value: null }
    } else {
      return { label: null, value: null }
    }
  }

  const handleSeekMedia = (_, stampValue) => {
    mediaRendererRef.current?.setState(stampValue)
  }
  
  EventEmitter.subscribe('open-media-with-src', data => { 
    setCurrProjectMetadata({
      label: 'Audio Player',
      type: data.type,
      src: data.src
    })
    setIsProjectOpen(true)
  })

  return (
    <div className="grid grid-rows-[auto,1fr] h-screen bg-[#f5f5f7]">
      <ProjectProvider>
        <ModalProvider>
          <header className="flex row-span-1 bg-transparent pt-2 px-2">
            <AppBar
              showToolbar={isProjectOpen}
              onCloseProject={() => { setIsProjectOpen(false) }}
              navItems={mediaComponents}
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
                <WelcomeMessage />
              )}
            </LeftPane>
            <RightPane>
              <TextEditor 
                ref={textEditorRef} 
                onStampInsert={handleGetMediaState} 
                onStampClick={handleSeekMedia}
              />
            </RightPane>
          </main>
        </ModalProvider>
      </ProjectProvider>
    </div>
  )
}

export default App 

