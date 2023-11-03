import './App.css'
import InlinesExample from './components/InlinesExample.js'
import React, { useState, useRef } from 'react'
import YoutubePlayer from './components/YoutubePlayer.js'
import { EventEmitter } from './components/EventEmitter.js'
import AudioRecorder from './components/AudioRecorder'
import AudioPlayer from './components/AudioPlayer.js'
import FileUpload from './components/FileUpload.js'

// Variables needed to calculate timestamp from audio recorder
let dateWhenRecLastInactive = new Date()
let dateWhenRecLastActive = dateWhenRecLastInactive
let recDuration = 0

const App = () => {
  const playerRef = useRef(null)
  const audioPlayerRef = useRef(null)
  const fileUploadModalRef = useRef(null)

  const [audioSource, setAudioSource] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)

  ////////////////////////////////
  ///  METHODS  //////////////////
  ////////////////////////////////

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
    // Fix: for unknown reasons, this event emits 4 times on pause
    // The if condition ensures recDuration only updates once per pause
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
    if (playerRef.current) playerRef.current.seekTo(value, true)
  })

  // return type must be { label: String, value: Any or null to abort operation }
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
      const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : null
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
    <div style={{ height: '100vh', overflowY: 'hidden', display: 'flex', flexDirection: 'row' }}>
          <div style={{ ...paneCSS, paddingLeft: '30px',paddingRight: '20px', overflowY: 'hidden', background: '#1b1b1b' }}>
            <FileUpload ref={fileUploadModalRef} onSubmit={handleOpenFile} type='audio/*' />
            {
              !showPlayer && !showAudioRecorder && !showAudioPlayer &&
              <div style={{ display: 'flex', flexDirection: 'column', color: 'white', overflowX: 'visible' }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Welcome to <strong>Notestamp</strong>, a web app that synchronizes your notes to audio or video.
                </pre>
                <br></br>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  How it works:
                  <ul>
                    <li style={{ whiteSpace: 'pre-wrap' }}>When recording or viewing media, hitting &lt;enter&gt; inside the editor will insert a timestamp at the beginning of a line.</li>
                    <li style={{ whiteSpace: 'pre-wrap' }}>Click a timestamp and instantly return to the specific moment in the audio or video.</li>
                    <li style={{ whiteSpace: 'pre-wrap' }}>Your notes persist across page reloads unless you clear the browser cache.</li>
                    <li style={{ whiteSpace: 'pre-wrap' }}>Download the document to your device and open it back in the editor with timestamps preserved.</li>
                  </ul>
                </pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}><strong style={{ color: 'red' }}>Warning: </strong>This app is still in development and has only been tested on Chrome desktop.</pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Features coming soon:
                  <ul>
                    <li style={{ whiteSpace: 'pre-wrap' }}>Synchronize your notes to a pdf document.</li>
                  </ul>
                </pre>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px'}}>
                  <button style={{ width: 'fitContent'}} onClick={() => setShowPlayer(true)}>Link YouTube video</button>
                  <button style={{ width: 'fitContent'}} onClick={() => fileUploadModalRef.current.showModal()}>Upload audio file</button>
                  <button style={{ width: 'fitContent'}} onClick={() => setShowAudioRecorder(true)}>Record audio</button>
                </div>
              </div>
            }
            {(showAudioRecorder || showAudioPlayer || showPlayer)
              && <button style={{ position: 'absolute', top: '10px', left: '10px', background: 'red', border: '0px', borderRadius: '3px', color: 'white' }}
                         onClick={() => { 
                          setShowAudioPlayer(false)
                          setShowPlayer(false)
                          setShowAudioRecorder(false)
                          playerRef.current = null
                          audioPlayerRef.current = null
                 }}>
                  x
                 </button>}
            {showPlayer && <YoutubePlayer ref={playerRef} />}
            {showAudioPlayer && <AudioPlayer src={audioSource} ref={audioPlayerRef} />}
            {showAudioRecorder && <AudioRecorder />}
          </div>
          <div style={{ ...paneCSS, paddingLeft: '20px', paddingRight: '30px', overflowY: 'auto' }}>
            <InlinesExample 
              editorStyle={editorCSS}
              onCreateBadge={setBadgeData} />
          </div>
    </div>  
  )
}

////////////////////////////////
///  CSS  //////////////////////
////////////////////////////////

const editorCSS = { 
  fontFamily: 'Times New Roman, monospace ,serif',
  background: 'white',
  outline: 'none',
  color: 'black',
  width: '100%',
  height: '100%',
  padding: '5px',
  overflowY: 'scroll',
  boxShadow: '0px 3px 15px rgba(0,0,0,0.2)'
}

const paneCSS = {
  height: '100%',
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: '#F5F5F7'
}

export default App 

