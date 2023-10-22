import './App.css';
import InlinesExample from './components/InlinesExample.js';
import React, { useState, useRef } from 'react';
import YoutubePlayer from './components/YoutubePlayer.js';
import { EventEmitter } from './components/EventEmitter.js';

const App = () => {
  const [textContentRequest, setTextContentRequest] = useState(false)
  const playerRef = useRef(null)
  const [showPlayer, setShowPlayer] = useState(false)

  ////////////////////////////////
  ///  METHODS  //////////////////
  ////////////////////////////////

  // Listen for request to save contents to text file
  EventEmitter.subscribe('textContentRequest', data => {
    // download data to text file
  }) 

  // when a badge is clicked, seek to its timestamp value
  EventEmitter.subscribe('badgeClicked', data => {
    const value = data[1]
    if (playerRef.current) playerRef.current.seekTo(value, true)
  })

  // return type must be { label: String, value: Any or null to abort operation }
  const setBadgeData = () => { 
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : null
    return { label: formatTime(currentTime), value: currentTime }    
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
            {
              !showPlayer &&
              <div style={{ display: 'flex', flexDirection: 'column', color: 'white'}}>
                <pre>
                  Welcome to <strong><i>Timestamp</i></strong>, a web app that synchronizes your notes to a video.
                </pre>
                <br></br>
                <pre>
                  How it works:
                  <ul>
                    <li>Open a YouTube video.</li>
                    <li>Hit &lt;enter&gt; to insert a timestamp at the beginning of a new line.</li>
                    <li>Click a timestamp to seek the video to it.</li>
                    <li>Your document persists even if you reload the page or close the browser.</li>
                  </ul>
                </pre>
                <br></br>
                <pre>
                  Features coming soon:
                  <ul>
                    <li>Record audio and synchronize to your notes.</li>
                    <li>Upload a pdf document and synchronize to your notes.</li>
                  </ul>
                </pre>
                <pre><i>Dedicated to the students of the University of Toronto.</i></pre>
                <pre><i>With love,</i></pre>
                <pre><i>- Olive</i></pre>
                <button style={{ alignSelf: 'center', width: 'fitContent'}} onClick={() => setShowPlayer(true)}>Get started</button>
              </div>
            }
            {showPlayer && <YoutubePlayer ref={playerRef} />}
          </div>
          <div style={{ ...paneCSS, paddingLeft: '20px', paddingRight: '40px', overflowY: 'auto' }}>
            <InlinesExample 
              editorStyle={editorCSS}
              textContentRequest={textContentRequest}
              onCreateBadge={setBadgeData} />
          </div>
    </div>
  )
}

////////////////////////////////
///  CSS  //////////////////////
////////////////////////////////

const editorCSS = { 
  fontFamily: 'Times New Roman, monospace,serif',
  background: 'white',
  outline: 'none',
  color: 'black',
  width: '100%',
  height: '100%',
  padding: '10px',
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

