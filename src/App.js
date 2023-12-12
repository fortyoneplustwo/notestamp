import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef } from 'react'
import YoutubePlayer from './components/YoutubePlayer.js'
import { EventEmitter } from './components/EventEmitter.js'
import AudioRecorder from './components/AudioRecorder'
import AudioPlayer from './components/AudioPlayer.js'
import FileUpload from './components/FileUpload.js'
import PdfReader from './components/PdfReader'
import './Button.css'
import DonateButton from './components/DonateButton'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'

const App = () => {
  const readerRef = useRef(null)
  const audioUploadModalRef = useRef(null)
  const pdfUploadModalRef = useRef(null)

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showLoginButton, setShowLoginButton] = useState(true)

  const [audioSource, setAudioSource] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showPdfWorker, setShowPdfWorker] = useState(false)

  ////////////////////////////////
  ///  METHODS  //////////////////
  ////////////////////////////////

  const handleCancelLogin = () => {
    setShowLoginForm(false)  
    setShowLoginButton(true)
  }

  const handleLoginBtnClicked = () => {
    setShowLoginForm(true)
    setShowLoginButton(false)
  }

  // close media handler
  const backToHomePage = () => {
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

  // Return type must be { label: String, value: Any or Null }
  const setStampData = (dateStampDataRequested) => { 
    if (showAudioPlayer) {
      const currentTime = readerRef.current.getState()
      return { label: formatTime(currentTime), value: currentTime }
    } else if (showAudioRecorder) {
      const currentTime = readerRef.current.getState(dateStampDataRequested)
      return { label: formatTime(currentTime), value: currentTime }    
    } else if (showPdfWorker) {
      const currentPage = readerRef.current.getState()
      return { label: 'p. ' + currentPage, value: currentPage}
    } else if (showYoutubePlayer) {
      const currentTime = readerRef.current.getState()
      return { label: formatTime(currentTime), value: currentTime }    
    } else {
      // value = null aborts stamp insertion
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
            <FileUpload ref={audioUploadModalRef} onSubmit={handleOpenFile} type='audio/*' />
            <FileUpload ref={pdfUploadModalRef} onSubmit={handleOpenPdfFile} type='application/pdf' />
            <header className='App-header'>
              <span style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold' }}>notestamp.</span>
              {showLoginButton && 
                <button style={{ marginLeft: 'auto', background: 'transparent', border: '0', cursor: 'pointer' }} 
                        onClick={handleLoginBtnClicked}>
                  <code>Login</code>
                </button>
              }
            </header>
            {
              !showYoutubePlayer && !showAudioRecorder && !showAudioPlayer && !showPdfWorker && !showLoginForm &&
              <div className='reader-homepage'>
                <WelcomeMessage /> 
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5em', marginTop: '20px'}}>
                  <button className='media-option-btn' onClick={() => setShowYoutubePlayer(true)}>Link YouTube video</button>
                  <button className='media-option-btn' onClick={() => audioUploadModalRef.current.showModal()}>Open audio file</button>
                  <button className='media-option-btn' onClick={() => setShowAudioRecorder(true)}>Record audio</button>
                  <button className='media-option-btn' onClick={() => pdfUploadModalRef.current.showModal()}>Open PDF</button>
                </div>
              </div>
            }
            {showLoginForm && <div className='reader-media-container'><Login onCancel={handleCancelLogin} /></div>}
            {showYoutubePlayer && <div className='reader-media-container'><YoutubePlayer ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showAudioPlayer && <div className='reader-media-container'><AudioPlayer src={audioSource} ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showAudioRecorder && <div className='reader-media-container'><AudioRecorder ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showPdfWorker && <div className='reader-media-container'><PdfReader ref={readerRef} src={pdfSource} closeComponent={backToHomePage} /></div>}
          <footer className='App-footer'>
            <code style={{ fontSize: 'small' }}>Buy me coffee?</code> &nbsp;&nbsp;&nbsp;  
            <DonateButton />
          </footer>
          </div>
          <div className='App-writer-container'>
            <div className='editor-container'>
              <TextEditor 
                onCreateStamp={setStampData} />
            </div>
          </div>
    </div>  
  )
}

export default App 

