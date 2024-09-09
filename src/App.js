import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef, useEffect } from 'react'
import { EventEmitter } from './components/EventEmitter.js'
import './Button.css'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import * as api from './api'
import MediaRenderer from './components/MediaRenderer'
import Nav from './components/Nav'
import MediaTitleBar from './components/MediaTitleBar'
import { myMediaComponents } from './components/NonCoreMediaComponents'
import { Icon } from './components/Toolbar'
import { ModalProvider, useModal } from './components/modal/ModalContext'
import { ProjectProvider } from './components/context/ProjectContext'

const App = () => {

  //////////////////////////
  ///  State variables  ////
  //////////////////////////

  const mediaControllerRef = useRef(null)
  const textEditorRef = useRef(null)
  const attachMediaController = controller => mediaControllerRef.current = controller

  // User session data. Updated only after a successful login
  const [user, setUser] = useState(null)
  const [projectSnapshot, setProjectSnapshot] = useState(null)
  const [requestedProject, setRequestedProject] = useState(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showLoginButton, setShowLoginButton] = useState(false)
  const [showLogoutButton, setShowLogoutButton] = useState(false)
  const [projectToSave, setProjectToSave] = useState('')
  const [toggleSave, setToggleSave] = useState(false)


  // Non-user-specific variables
  const { openModal, closeModal } = useModal()
  const [showMedia, setShowMedia] = useState(null)
  const [mediaRendererProps, setMediaRendererProps] = useState(null)
  const [mediaComponents, setMediaComponents] = useState([
    { label: 'YouTube Player', type: 'youtube', path: './YoutubePlayer.js' },
    { label: 'Audio Player', type: 'audio', path: './AudioPlayer.js' },
    { label: 'Sound Recorder', type: 'recorder', path: './AudioRecorder.js' },
    { label: 'Pdf Reader', type: 'pdf', path: './PdfReader.js' }
  ])

  ////////////////////////////////
  ///  Initialization  ///////////
  ////////////////////////////////
  
  // Import non-core components
  useEffect(() => {
    setMediaComponents(m => {
      return [...m, ...myMediaComponents]
    })
  }, [])

  // Save (i.e. upload) the project when the dependency is toggled
  useEffect(() => {
    if (!projectToSave) return
    closeModal()
    openModal("uploadProgress")
		const { metadata, content, media } = projectSnapshot
      api.saveProject({ ...metadata, title: projectToSave }, content, media)
      .then(dir => {
        closeModal()
        if (dir) {
          setUser({
            ...user,
            directory: dir
          })	
          setRequestedProject({
            metadata: {...projectSnapshot.metadata}, 
            content: projectSnapshot.content,
          })
        }
      })
      .catch(error => console.error(error))
  }, [toggleSave])

  /////////////////////////////////
  ///  METHODS  (user session) ////
  /////////////////////////////////

  const handleLoggedIn = user => {
    setUser({
      email: user.email,
      directory: user.directory
    })
    setShowLoginForm(false)
    setShowLogoutButton(true)
  }

  const handleOpenProject = async title => {
    try {
      openModal("downloadProgress")
      const result = await api.getProjectData(title)
      closeModal()
      if (result === null) {
        throw new Error('Error fetching project')
      } else {
        const { metadata, content } = result
        setRequestedProject({ 
          metadata: {...metadata},
          content: JSON.parse(content)
        })
        setShowMedia(() => {
          setMediaRendererProps({ ...metadata })
          return true 
        })
        textEditorRef.current.setContent(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // The purpose of staging is to capture the state of the 
  // current project into the 'projectSnapshot' state var.
  const handleStageChanges = () => {
    const metadata = mediaControllerRef.current ? mediaControllerRef.current.getMetadata() : null
    if (!metadata) return
    if ('title' in metadata) metadata.src = '' // Ensure media source cannot be overwritten
    const content = textEditorRef.current.getContent()
    const media = mediaControllerRef.current ? mediaControllerRef.current.getMedia() : null
    if (media) {
      metadata.src = '' // Ensure media and src are mutually exclusive
      if (!metadata.mimetype) return
    }
    console.log(metadata, content, media)
    setProjectSnapshot({ metadata: { ...metadata }, content: content, media: media })
  }

  const handleDeleteProject = title => {
    api.deleteProject(title)
      .then(newDir => {
        if (newDir) {
          setUser({
            ...user,
            directory: newDir
          })
        }
      })
  }

  const handleLogOut = () => {
    api.logOut()
      .then(result => {
        if (result) {
          // reset user session data
          setShowLoginButton(true)
          setShowLogoutButton(false)
          setUser(null)
          setRequestedProject({
            metadata: { title: '', type: '', src: '' },
            content: ''
          })
          setProjectSnapshot(null)
          handleBackToHomepage()
        }
      })
  }

  ////////////////////////////////////
  ///  METHODS (no login required) ///
  ////////////////////////////////////

  const handleCancelLogin = () => {
    setShowLoginForm(false)  
    setShowLoginButton(true)
  }

  const handleLoginBtnClicked = () => {
    setShowLoginForm(true)
    setShowLoginButton(false)
  }

  const handleBackToHomepage = () => {
    setShowMedia((_) => {
      if (user && requestedProject) {
        const currMetadata = mediaControllerRef.current 
          ? mediaControllerRef.current.getMetadata() 
          : null 
        const currContent = JSON.stringify(textEditorRef.current.getContent())
        const prevContent = JSON.stringify(requestedProject.content)

        let projectModified = false
        if (currMetadata) {
          if (prevContent !== currContent) {
            projectModified = true
          }
        }

        if (projectModified) {
          openModal("unsavedChangesNotifier", {
            onClose: closeModal,
            onSave: () => {
              handleStageChanges()
              closeModal()
              setToggleSave(s => {
                setProjectToSave(requestedProject.metadata.title)
                setShowMedia(false)
                setRequestedProject(null)
                return !s
              })
            },
            onDiscard: () => {
              closeModal()
              setRequestedProject(null)
              setShowMedia(false)
            },
          })
          // Keep the media open since we don't know whether the
          // user will choose to to save changes or not.
          // If they do, the modal's handler will take care 
          // of closing the media component for us.
          return true
        } else {
          setRequestedProject(null)
        }
      }
      return false
    }) 
  }

  const handleCreateNewProject = (label, type) => {
    setShowMedia(() => {
      setRequestedProject(null)
      setMediaRendererProps({ label: label, type: type, src: '', title: '', mimetype: '' })
      return true
    })
  }

  // Called when a stamp in inserted. Return value must be an object.
  // {
  //    label: String or null       String rendered inside of the stamp
  //    value: Any or Null          Actual stamp value
  // }
  const getStampDataFromMedia = dateStampRequested => { 
    if (mediaControllerRef.current) {
      const stampData = mediaControllerRef.current.getState(dateStampRequested)
      return stampData ? stampData : { label: null, value: null }
    } else {
      return { label: null, value: null }
    }
  }
  
  ////////////////////////
  ///  EVENT LISTENERS ///
  ////////////////////////

  // Dispatched from a media component (usually one that captures media e.g. sound recorder)
  // to open the captured media in a different media component (e.g. audio player)
  EventEmitter.subscribe('open-media-with-src', data => { 
    setMediaRendererProps({
      label: 'Audio Player',
      type: data.type,
      src: data.src
    })
    setShowMedia(true)
  })

  EventEmitter.subscribe('stamp-clicked', data => {
    const stampValue = data[1]
    if (mediaControllerRef.current) mediaControllerRef.current.setState(stampValue)
  })

  ////////////////
  ///  JSX  //////
  ////////////////

  return (
    <>
      <ProjectProvider media={mediaControllerRef} editor={textEditorRef}>
        <header className="flex row-span-1 bg-transparent pt-1 px-2">
          <span className="bg-transparent mr-4 text-[#FF4500] font-bold">notestamp</span>
          <span className="flex items-center" >
            {showMedia 
              ? (
                <MediaTitleBar
                  label={mediaRendererProps.label}
                  title={requestedProject?requestedProject.metadata.title:''}
                  onClose={handleBackToHomepage}
                  onSave={() => {
                    handleStageChanges()
                    if (!requestedProject) { 
                      openModal("projectSaver", {
                        onSave: (event) => {
                          setToggleSave(s => {
                            setProjectToSave(event.target.elements.filename.value)
                            return !s
                          })
                        },
                        onClose: closeModal,
                      })
                    } else {
                      setToggleSave(s => {
                        setProjectToSave(requestedProject.metadata.title)
                        return !s
                      })
                    }
                  }}
                  user={user}
                />
              ) : <Nav items={mediaComponents} onClick={handleCreateNewProject} />
            }
          </span>
          <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            {  showLoginButton &&
              <button className="bg-transparent text-black border-none mr-1 cursor-pointer"
                style={{ marginRight: '10px' }}
                onClick={handleLoginBtnClicked}
              >
                <Icon style={{ fontSize: 'medium', marginRight: '5px' }}>person</Icon>
                Sign in
              </button>
            }
            { showLogoutButton &&
              <button className="bg-transparent text-black border-none mr-1 cursor-pointer"
                style={{ marginRight: '10px' }}
                onClick={handleLogOut}
              >
                <Icon style={{ fontSize: 'medium', marginRight: '5px' }}>logout</Icon>
                Sign out
              </button>
            }
          </span>
        </header>

        <main className="row-span-2 grid grid-cols-2">
          <div className='grid grid-row-1 pl-2 pr-1 py-2 overflow-auto'>
            <div className="bg-white row-span-1 border border-solid rounded-md overflow-hidden">
              { !showMedia && !showLoginForm && !user && 
                <WelcomeMessage />
              }
              { !showMedia && !showLoginForm && user &&
                <Dashboard directory={user.directory} 
                  onOpenProject={handleOpenProject} 
                  onDeleteProject={handleDeleteProject}
                />
              }
              { showLoginForm &&
                <Login onCancel={handleCancelLogin} 
                  successCallback={handleLoggedIn}
                />
              }
              { showMedia && <MediaRenderer ref={attachMediaController} {...mediaRendererProps} /> }
            </div>
          </div>

          <div className="grid grid-row-1 pl-1 pr-2 py-2 overflow-hidden">
            <div className="row-span-1 h-100% border border-solid rounded-md overflow-hidden">
              <TextEditor ref={textEditorRef}
                getStampData={getStampDataFromMedia} 
              />
            </div>
          </div>
        </main>
      </ProjectProvider>
    </>
  )
}

export default App 

