import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef, useEffect } from 'react'
import { EventEmitter } from './components/EventEmitter.js'
import './Button.css'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { deleteProject, getProjectData, logOut, saveProject } from './api'
import Modal from './components/Modal'
import MediaRenderer from './components/MediaRenderer'
import Nav from './components/Nav'
import MediaTitleBar from './components/MediaTitleBar'
import { myMediaComponents } from './components/NonCoreMediaComponents'

const App = () => {

  //////////////////////////
  ///  State variables  ////
  //////////////////////////

  const mediaRef = useRef(null)

  // User session data. Updated only after a successful login
  const [user, setUser] = useState(null)
  const [project, setProject] = useState({
    metadata: {
      title: '',
      type: '',
      link: ''
    },
    content: ''
  })
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showLoginButton, setShowLoginButton] = useState(true)
  const [showLogoutButton, setShowLogoutButton] = useState(false)
  const saveModalRef = useRef(null)

  // Non-user-specific variables
  const [showMedia, setShowMedia] = useState(null)
  const [mediaState, setMediaState] = useState(null)
  const [mediaComponents, setMediaComponents] = useState([
    { label: 'YouTube Player', type: 'youtube', path: './YoutubePlayer.js' },
    { label: 'Audio Player', type: 'audio', path: './AudioPlayer.js' },
    { label: 'Sound Recorder', type: 'recorder', path: './AudioRecorder.js' },
    { label: 'PDF Reader', type: 'pdf', path: './PdfReader.js' }
  ])

  ////////////////////////////////
  ///  Initialization  ///////////
  ////////////////////////////////

  // Import non-core components
  useEffect(() => {
    setMediaComponents([...mediaComponents, ...myMediaComponents])
  }, [])

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

  const handleLogoutBtnClicked = () => {
    logOut()
      .then(result => {
        if (result) {
          // reset user session data
          setShowLoginButton(true)
          setShowLogoutButton(false)
          setUser(null)
          setProject(null)
          setMediaState(null)
        }
      })
  }

  const handleOpenProject = title => {
    getProjectData(title)
    .then(data => {
        if (data) {
          const { metadata, content } = data
          setProject({ 
            metadata: { ...metadata },
            content: content,
          })
          if (project.metadata.type) {
            setMediaState({
              type: project.metadata.type,
              src: project.metadata.link
            })
            setShowMedia(true)
          }
          // Handle open for other media formats here
        } 
      })
  }

  // take snapshot of reader state and show show save modal
  const handleCaptureReaderState = () => {
    const state = mediaRef.current ? mediaRef.current.getState() : null
    if (!state) {
      setMediaState({
        type: 'none',
        src: ''
      })
    } else {
      const { type, src } = state
      setMediaState({
        type: type ? type : '',
        src: src ? src : ''
      })
    }
    saveModalRef.current.showModal()
  }

  // Handle save project
  const handleSaveProject = filename => {
    const content = localStorage.getItem('content')
    saveModalRef.current.close()
    saveProject({ 
      title: filename,
      type: mediaState.type,
      link: mediaState.src
    }, content)
      .then(dir => {
        if (dir) setUser({
          ...user,
          directory: dir
        })
      })
  }

  const handleDeleteProject = title => {
    deleteProject(title)
      .then(newDir => {
        if (newDir) {
          setUser({
            ...user,
            directory: newDir
          })
        }
      })
  }

  ///////////////////////////////////
  ///  METHODS (no login required) //
  ///////////////////////////////////

  const handleCancelLogin = () => {
    setShowLoginForm(false)  
    setShowLoginButton(true)
  }

  const handleLoginBtnClicked = () => {
    setShowLoginForm(true)
    setShowLoginButton(false)
  }

  // close media handler
  const handleBackToHomepage = () => {
    mediaRef.current = null
    setShowMedia(false)
  }

  const openMedia = (label, type, path) => {
    setMediaState({ label: label, type: type, path: path })
    setShowMedia(true)
  }

  // Dispatched when recorder stopped
  EventEmitter.subscribe('recorder-stopped', data => { 
    setMediaState({
      label: 'Audio Player',
      type: 'audio',
      path: './AudioPlayer',
      // src field is unique to this scenario
      // because we want to load the Audio Player
      // with the recording from the Sound Recorder
      src: data
    })
    setShowMedia(true)
  })

  // When a stamp is clicked, seek reader to the stamp's value
  EventEmitter.subscribe('stamp-clicked', data => {
    const stampValue = data[1]
    if (mediaRef.current) mediaRef.current.setState(stampValue)
  })

  // Return value must be an object
  // {
  //    label: String or null       String rendered inside of the stamp
  //    value: Any or Null          Actual stamp value
  // }
  const getStampDataFromMedia = (dateStampDataRequested) => { 
    if (mediaRef.current) { // make sure the media ref is actually available
      const stampData = mediaRef.current.getState(dateStampDataRequested)
      return stampData ? stampData : { label: null, value: null }
    } else {
      return { label: null, value: null }
    }
  }
  
  ////////////////////////////////
  ///  JSX  //////////////////////
  ////////////////////////////////

  return (
    <div className='app-container'>
      <header>
          <span className='logo'>notestamp</span>
          <span className='nav-bar'>
            { showMedia
              ? <MediaTitleBar title={mediaState.label} onClose={handleBackToHomepage} />
              : <Nav items={mediaComponents} onClick={openMedia} />
            }
          </span>
      </header>

      <main>
        <div className='left-pane'>
          <Modal ref={saveModalRef}>
            <form onSubmit={e => {
              e.preventDefault()
              handleSaveProject(e.target.elements.filename.value)
            }}>
              <p>Name your project</p>
              <br></br>
              <input type='text' name='filename' />
              <button type='submit'>save</button>
            </form>
          </Modal>

          { !showMedia && !showLoginForm
            && <div className='left-pane-content-container'>
              { user
                ? <Dashboard directory={user.directory} 
                    onOpenProject={handleOpenProject} 
                    onDeleteProject={handleDeleteProject}
                  />
                : <WelcomeMessage />
              } 
            </div>
          }

          { showLoginForm 
            && <div className='left-pane-content-container'>
              <Login onCancel={handleCancelLogin} 
                successCallback={handleLoggedIn}
              />
            </div>
          }

          { showMedia
            && <div className='left-pane-content-container'>
                  <MediaRenderer ref={mediaRef} 
                    type={mediaState.type}
                    src={mediaState.src} 
                  />
            </div>
          }
        </div>

        <div className='right-pane'>
          <div className='editor-container'>
            <TextEditor 
              user={user}
              onRequestStampData={getStampDataFromMedia} 
              onSave={handleCaptureReaderState}
              content={project?project.content:null} />
          </div>
        </div>
      </main>
    </div>  
  )
}

export default App 

