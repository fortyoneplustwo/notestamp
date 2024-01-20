import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef } from 'react'
import { EventEmitter } from './components/EventEmitter.js'
import './Button.css'
import { Icon } from './components/Toolbar'
import DonateButton from './components/DonateButton'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { deleteProject, getProjectData, logOut, saveProject } from './api'
import Modal from './components/Modal'
import Media from './components/Media'

const App = () => {
  const mediaRef = useRef(null)
  const audioUploadModalRef = useRef(null)
  const pdfUploadModalRef = useRef(null)

  // User session data. These can be updated only
  // after a successful login
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

  const [showMedia, setShowMedia] = useState(null)
  const [readerState, setReaderState] = useState(null)


  ///////////////////////////////////
  ///  METHODS  (user logged in) ////
  ///////////////////////////////////

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
          setReaderState(null)
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
            setReaderState({
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
      setReaderState({
        type: 'none',
        src: ''
      })
    } else {
      const { type, src } = state
      setReaderState({
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
      type: readerState.type,
      link: readerState.src
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

  // Dispatched when recorder stopped
  EventEmitter.subscribe('recorder-stopped', data => { 
    setReaderState({
      type: 'audio',
      src: data
    })
    setShowMedia(true)
  })

  // When a stamp is clicked, seek reader to the stamp's value
  EventEmitter.subscribe('stamp-clicked', data => {
    const stampValue = data[1]
    if (mediaRef.current) mediaRef.current.setState(stampValue)
  })

  // Return value must be an object with keys
  // {
  //    label: String or null       String rendered inside of the stamp
  //    value: Any or Null          Actual stamp value
  // }
  const setStampData = (dateStampDataRequested) => { 
    if (mediaRef.current) { // make sure the media ref is actually available
      if (readerState.type === 'audio') {
        const currentTime = mediaRef.current.getState()
        return { label: formatTime(currentTime), value: currentTime ? currentTime : null }
      } else if (readerState.type === 'recorder') {
        const currentTime = mediaRef.current.getState(dateStampDataRequested)
        return { label: formatTime(currentTime), value: currentTime ? currentTime : null }    
      } else if (readerState.type === 'pdf') {
        const currentPage = mediaRef.current.getState()
        return { label: currentPage ? 'p. ' + currentPage : null, value: currentPage}
      } else if (readerState.type === 'youtube') {
        const currentTime = mediaRef.current.getState().value
        return { label: formatTime(currentTime), value: currentTime ? currentTime : null }    
      } else {
        return { label: null, value: null }
      }
    } else {
      return { label: null, value: null }
    }
  }

  // format time to MM:SS
  function formatTime(seconds) {
    if (!seconds) return null
    seconds = Math.round(seconds)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const formattedTime =
      `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    return formattedTime
  }
  
  ////////////////////////////////
  ///  JSX  //////////////////////
  ////////////////////////////////

  return (
    <div className='App-canvas'>
          <div className='App-reader-container'>
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
            <Modal ref={audioUploadModalRef} >
              <form onChange={e => { handleOpenAudioFile(e.target.files[0]) }}>
                <input type='file' accept='audio/*' />
              </form>
            </Modal>
            <Modal ref={pdfUploadModalRef} >
              <form onChange={e => { handleOpenPdfFile(e.target.files[0]) }}>
                <input type='file' accept='application/pdf*' />
              </form>
            </Modal>

            <header className='App-header'>
              <span style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold' }}>notestamp</span>
              {showLoginButton && 
                <button className='media-option-btn' 
                        style={{ marginLeft: 'auto', width: '7em'}}
                        onClick={handleLoginBtnClicked}>
              <Icon>login</Icon>
              &nbsp;
              Login
                </button>
              }
              {showLogoutButton && 
                <button className='media-option-btn' 
                        style={{ marginLeft: 'auto', width: '7em'}}
                        onClick={handleLogoutBtnClicked}>
              <Icon>logout</Icon>
              &nbsp;
              Log out
                </button>
              }
            </header>

            { !showMedia &&
              !showLoginForm &&
              <div className='reader-homepage'>
                <div>
                  <nav>
                    <ul style={{margin: '0', padding: '0 10px 10px 0'}}>
                      <button className='nav-btn' 
                        onClick={() => { 
                          setReaderState({
                            type: 'youtube',
                            src: ''
                          })
                          setShowMedia(true)
                      }}>
                        YouTube
                      </button>
                      <button className='nav-btn'
                        onClick={() => {
                          setReaderState({
                            type: 'audio',
                            src: ''
                          })
                          setShowMedia(true)
                      }}>
                        Audio player
                      </button>
                      <button className='nav-btn' 
                        onClick={() => {
                          setReaderState({ type: 'recorder' })
                          setShowMedia(true)
                        }}>
                        Recorder
                      </button>
                      <button className='nav-btn' 
                        onClick={() => {
                          setReaderState({ type: 'pdf' })
                          setShowMedia(true)
                      }}>
                        PDF
                      </button>
                    </ul>
                  </nav>
                </div>
                {user && <Dashboard directory={user.directory} 
                  onOpenProject={handleOpenProject} 
                  onDeleteProject={handleDeleteProject}/>
                }
                {!user && <WelcomeMessage />} 
              </div>
            }
            {showLoginForm && 
              <div className='reader-media-container'>
                <Login onCancel={handleCancelLogin} 
                  successCallback={handleLoggedIn} />
              </div>
            }
            {showMedia &&
              <div className='reader-media-container'>
                <Media ref={mediaRef} 
                  type={readerState.type}
                  src={readerState.src} 
                  onClose={handleBackToHomepage} />
              </div>
            }

          <footer className='App-footer'>
            <p>Buy me coffee?</p> &nbsp;&nbsp;&nbsp;  
            <DonateButton />
          </footer>
          </div>

          <div className='App-writer-container'>
            <div className='editor-container'>
              <TextEditor 
                user={user}
                onRequestStampData={setStampData} 
                onSave={handleCaptureReaderState}
                content={project?project.content:null} />
            </div>
          </div>
    </div>  
  )
}

export default App 

