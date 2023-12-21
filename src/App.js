import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef, useEffect } from 'react'
import YoutubePlayer from './components/YoutubePlayer.js'
import { EventEmitter } from './components/EventEmitter.js'
import AudioRecorder from './components/AudioRecorder'
import AudioPlayer from './components/AudioPlayer.js'
import FileUpload from './components/FileUpload.js'
import PdfReader from './components/PdfReader'
import './Button.css'
import { Icon } from './components/Toolbar'
import DonateButton from './components/DonateButton'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { logOut } from './api'

const App = () => {
  const readerRef = useRef(null)
  const audioUploadModalRef = useRef(null)
  const pdfUploadModalRef = useRef(null)

  // User session data. These can be updated only
  // after a successful login
  const [user, setUser] = useState(null)
  const [project, setProject] = useState(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showLoginButton, setShowLoginButton] = useState(true)
  const [showLogoutButton, setShowLogoutButton] = useState(false)

  const [audioSource, setAudioSource] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showPdfWorker, setShowPdfWorker] = useState(false)

  ///////////////////////////////////
  ///  METHODS  (user logged in) ////
  ///////////////////////////////////

  const handleOpenProject = (title, stmp) => {
    setProject({ 
      ...project,
      title: title,
      stmp: stmp
    })
  }

  const handleDeleteProject = newDir => {
    setUser({
      ...user,
      directory: newDir
    })
  }

  // Set user session data on login
  const handleLoginSuccess = userData => {
    setShowLoginForm(false)
    setUser({
      ...user,
      email: userData.email,
      directory: userData.directory
    })
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
    setShowAudioPlayer(false)
    setShowYoutubePlayer(false)
    setShowAudioRecorder(false)
    setShowPdfWorker(false)
  }

  // Upload pdf file
  const handleOpenPdfFile = (file, modal) => {
    modal.current.close()
    setPdfSource(file)
    setShowPdfWorker(true)
  }

  // Upload audio file
  const handleOpenFile = (file, modal) => {
    modal.current.close()
    setAudioSource(window.URL.createObjectURL(file)) 
    setShowAudioPlayer(true)
  }

  // Dispatched when recorder stopped
  EventEmitter.subscribe('recorder-stopped', data => { 
    setShowAudioPlayer(true)
    setAudioSource(data)
    setShowAudioRecorder(false)
  })

  // When a stamp is clicked, seek reader to the stamp's value
  EventEmitter.subscribe('stamp-clicked', data => {
    const stampValue = data[1]
    if (readerRef.current) readerRef.current.setState(stampValue)
  })

  // Return value must be: 
  // { 
  //    label: String or Null,
  //    value: Any or Null (value=null aborts stamp insertion)
  // }
  const setStampData = (dateStampDataRequested) => { 
    if (showAudioPlayer) {
      const currentTime = readerRef.current.getState()
      return { label: currentTime ? formatTime(currentTime) : null, value: currentTime }
    } else if (showAudioRecorder) {
      const currentTime = readerRef.current.getState(dateStampDataRequested)
      return { label: currentTime ? formatTime(currentTime) : null, value: currentTime }    
    } else if (showPdfWorker) {
      const currentPage = readerRef.current.getState()
      return { label: currentPage ? 'p. ' + currentPage : null, value: currentPage}
    } else if (showYoutubePlayer) {
      const currentTime = readerRef.current.getState()
      return { label: currentTime ? formatTime(currentTime) : null, value: currentTime }    
    } else {
      return { label: null, value: null }
    }
  }

  // format time to MM:SS
  function formatTime(seconds) {
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
            <FileUpload ref={audioUploadModalRef} 
              onSubmit={handleOpenFile} 
              type='audio/*' />
            <FileUpload ref={pdfUploadModalRef} 
              onSubmit={handleOpenPdfFile} 
              type='application/pdf' />
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
            {
              !showYoutubePlayer && 
              !showAudioRecorder && 
              !showAudioPlayer && 
              !showPdfWorker && 
              !showLoginForm &&
              <div className='reader-homepage'>
                <div>
                  <nav>
                    <ul style={{margin: '0', padding: '10px'}}>
                      <button className='nav-btn' 
                        onClick={() => setShowYoutubePlayer(true)}>
                          Play YouTube video
                      </button>
                      <button className='nav-btn' 
                        onClick={() => audioUploadModalRef.current.showModal()}>
                          Open audio file
                      </button>
                      <button className='nav-btn' 
                        onClick={() => setShowAudioRecorder(true)}>
                          Record audio
                      </button>
                      <button className='nav-btn' 
                        onClick={() => pdfUploadModalRef.current.showModal()}>
                          Open PDF document
                      </button>
                    </ul>
                  </nav>
                </div>
                {user && <Dashboard directory={user.directory} 
                  onProjectSelected={handleOpenProject} 
                  onProjectDeleted={handleDeleteProject}/>
                }
                {!user && <WelcomeMessage />} 
              </div>
            }
            {showLoginForm && 
              <div className='reader-media-container'>
                <Login onCancel={handleCancelLogin} 
                  successCallback={handleLoginSuccess} />
              </div>
            }
            {showYoutubePlayer && 
              <div className='reader-media-container'>
                <YoutubePlayer ref={readerRef} 
                  closeComponent={handleBackToHomepage} />
              </div>
            }
            {showAudioPlayer && 
              <div className='reader-media-container'>
                <AudioPlayer src={audioSource} 
                  ref={readerRef} 
                  closeComponent={handleBackToHomepage} />
              </div>
            }
            {showAudioRecorder && 
              <div className='reader-media-container'>
                <AudioRecorder ref={readerRef} 
                  closeComponent={handleBackToHomepage} />
              </div>
            }
            {showPdfWorker && 
              <div className='reader-media-container'>
                <PdfReader ref={readerRef} 
                  src={pdfSource} 
                  closeComponent={handleBackToHomepage} />
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
                onCreateStamp={setStampData} 
                project={project} />
            </div>
          </div>
    </div>  
  )
}

export default App 

