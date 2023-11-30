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

// Variables needed to compute timestamp from audio recorder
let dateWhenRecLastInactive = new Date()
let dateWhenRecLastActive = dateWhenRecLastInactive
let recDuration = 0

const App = () => {
  const youtubePlayerRef = useRef(null)
  const audioPlayerRef = useRef(null)
  const fileUploadModalRef = useRef(null)

  const [audioSource, setAudioSource] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showPdfWorker, setShowPdfWorker] = useState(false)

  ////////////////////////////////
  ///  METHODS  //////////////////
  ////////////////////////////////

  // close media handler
  const backToHomePage = () => {
    setShowAudioPlayer(false)
    setShowPlayer(false)
    setShowAudioRecorder(false)
    youtubePlayerRef.current = null
    audioPlayerRef.current = null
  }

  // Upload audio file
  const handleOpenFile = (file, modal) => {
    modal.current.close()
    setAudioSource(window.URL.createObjectURL(file)) 
    setShowAudioPlayer(true)
  }

  // Dispatched when recorder started or resumed
  EventEmitter.subscribe('recorder-active', data => { dateWhenRecLastActive = data })

  // Dispatched when recorder paused or stopped
  EventEmitter.subscribe('recorder-inactive', data => {
    // Fix: for unknown reasons, pause event emits 4 times
    // The if condition ensures that recDuration only updates once per pause
    if (dateWhenRecLastInactive !== data) {
      recDuration += (data - dateWhenRecLastActive)
    }
    dateWhenRecLastInactive = data
  })

  // Dispatched when recorder stopped
  EventEmitter.subscribe('recorder-stopped', data => { 
    setShowAudioPlayer(true)
    setAudioSource(data)
    setShowAudioRecorder(false)
  })

  // When a badge is clicked, seek to its timestamp value
  EventEmitter.subscribe('badge-clicked', data => {
    const value = data[1]
    if (audioPlayerRef.current) { 
      audioPlayerRef.current.currentTime = value
      audioPlayerRef.current.play()
    }
    if (youtubePlayerRef.current) youtubePlayerRef.current.seekTo(value, true)
  })

  // Return type must be { label: String, value: Any or Null }
  // value = null aborts the stamp insertion
  const setBadgeData = (dateBadgeRequested) => { 
    if (showAudioPlayer) {
      const currentTime = audioPlayerRef.current.currentTime
      return { label: formatTime(currentTime), value: currentTime }
    } else if (showAudioRecorder) {
      let timestamp = null
      if (dateWhenRecLastActive > dateWhenRecLastInactive) {
        timestamp = recDuration + (dateBadgeRequested - dateWhenRecLastActive)
      } else {
        timestamp = recDuration
      }
      timestamp = Math.floor(timestamp / 1000)
      return { label: formatTime(timestamp), value: timestamp }    
    } else {
      const currentTime = youtubePlayerRef.current ? youtubePlayerRef.current.getCurrentTime() : null
      return { label: formatTime(currentTime), value: currentTime }    
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
            <FileUpload ref={fileUploadModalRef} onSubmit={handleOpenFile} type='audio/*' />
            <header className='App-header'>
              <p style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold'}}>notestamp.</p>
            </header>
            {
              !showPlayer && !showAudioRecorder && !showAudioPlayer && !showPdfWorker &&
              <div className='reader-homepage'>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Welcome to <strong>Notestamp</strong>, a web app that synchronizes your notes to media.
                </pre>
                <br></br>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  How it works:
                  <ul>
                    <li>While recording or viewing media, press &lt;enter&gt; to insert a stamp at the start of a line (&lt;shift + enter&gt; to avoid stamping).</li>
                    <li>Click a stamp and instantly return to the specific moment at which the note was stamped.</li>
                    <li>Your notes will persist across page reloads unless you clear the browser cache.</li>
                    <li>Saving your notes as a .stmp file will preserve the stamps. This file can then be opened back in the editor.</li>
                    <li>Alternatively you may export your notes without stamps to a pdf document.</li>
                  </ul>
                </pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}><strong style={{ color: '#FFC439' }}>Warning: </strong>This app is still in development and has only been tested on Chrome desktop.</pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Features coming soon:
                  <ul>
                    <li>Synchronize your notes to a pdf document.</li>
                  </ul>
                </pre>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5em', marginTop: '20px'}}>
                  <button className='media-option-btn' onClick={() => setShowPlayer(true)}>Link YouTube video</button>
                  <button className='media-option-btn' onClick={() => fileUploadModalRef.current.showModal()}>Open audio file</button>
                  <button className='media-option-btn' onClick={() => setShowAudioRecorder(true)}>Record audio</button>
                  <button className='media-option-btn' onClick={() => setShowPdfWorker(true)}>Open PDF</button>
                </div>
              </div>
            }
            {showPlayer && <div className='reader-media-container'><YoutubePlayer ref={youtubePlayerRef} closeComponent={backToHomePage} /></div>}
            {showAudioPlayer && <div className='reader-media-container'><AudioPlayer src={audioSource} ref={audioPlayerRef} closeComponent={backToHomePage} /></div>}
            {showAudioRecorder && <div className='reader-media-container'><AudioRecorder closeComponent={backToHomePage} /></div>}
            {showPdfWorker && <div className='reader-media-container'><PdfReader /></div>}
          </div>
          <div className='App-writer-container'>
            <div className='editor-container'>
              <TextEditor 
                onCreateBadge={setBadgeData} />
            </div>
          </div>
    </div>  
  )
}

export default App 
          // <footer className='App-footer'>
          //   <code style={{ fontSize: 'small' }}>Buy me coffee?</code> &nbsp;&nbsp;&nbsp;  
          //   <form action="https://www.paypal.com/donate" method="post" target="_top">
          //     <input type="hidden" name="business" value="L7VEWD374RJ38" />
          //     <input type="hidden" name="no_recurring" value="0" />
          //     <input type="hidden" name="item_name" value="Help me dedicate more time to developing this application and keep it free." />
          //     <input type="hidden" name="currency_code" value="CAD" />
          //     <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
          //     <img alt="" border="0" src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
          //   </form>
          // </footer>

