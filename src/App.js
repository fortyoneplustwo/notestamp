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

const App = () => {
  const readerRef = useRef(null)
  const audioUploadModalRef = useRef(null)
  const pdfUploadModalRef = useRef(null)

  const [audioSource, setAudioSource] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showPdfWorker, setShowPdfWorker] = useState(false)

  ////////////////////////////////
  ///  METHODS  //////////////////
  ////////////////////////////////

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
  // value = null aborts the stamp insertion
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
    } else {
      const currentTime = readerRef.current.getState()
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
            <FileUpload ref={audioUploadModalRef} onSubmit={handleOpenFile} type='audio/*' />
            <FileUpload ref={pdfUploadModalRef} onSubmit={handleOpenPdfFile} type='application/pdf' />
            <header className='App-header'>
              <p style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold'}}>notestamp.</p>
            </header>
            {
              !showYoutubePlayer && !showAudioRecorder && !showAudioPlayer && !showPdfWorker &&
              <div className='reader-homepage'>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Welcome to <strong>Notestamp</strong>, a web app that synchronizes your notes to media.
                </pre>
                <br></br>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Instructions:
                  <ul>
                    <li>When recording or viewing media, press &lt;enter&gt; to insert a stamp.</li>
                    <li>&lt;shift + enter&gt; to avoid stamping.</li>
                    <li>Click a stamp and instantly seek the media to the stamp value.</li>
                    <li>Your notes persist across page reloads unless you clear the browser cache.</li>
                    <li>Save your project as a .stmp file, stamps included.</li>
                    <li>Export your notes as a .pdf file, stamps excluded.</li>
                    <li>Open your project back into the editor for further editing.</li>
                  </ul>
                </pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}><strong style={{ color: '#FFC439' }}>Warning: </strong>This app is still in development and has only been tested on Chrome desktop.</pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  Features in development:
                  <ul>
                    <li>Cloud storage (subscription based plan)</li>
                  </ul>
                </pre>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5em', marginTop: '20px'}}>
                  <button className='media-option-btn' onClick={() => setShowYoutubePlayer(true)}>Link YouTube video</button>
                  <button className='media-option-btn' onClick={() => audioUploadModalRef.current.showModal()}>Open audio file</button>
                  <button className='media-option-btn' onClick={() => setShowAudioRecorder(true)}>Record audio</button>
                  <button className='media-option-btn' onClick={() => pdfUploadModalRef.current.showModal()}>Open PDF</button>
                </div>
              </div>
            }
            {showYoutubePlayer && <div className='reader-media-container'><YoutubePlayer ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showAudioPlayer && <div className='reader-media-container'><AudioPlayer src={audioSource} ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showAudioRecorder && <div className='reader-media-container'><AudioRecorder ref={readerRef} closeComponent={backToHomePage} /></div>}
            {showPdfWorker && <div className='reader-media-container'><PdfReader ref={readerRef} src={pdfSource} closeComponent={backToHomePage} /></div>}
          <footer className='App-footer'>
            <code style={{ fontSize: 'small' }}>Buy me coffee?</code> &nbsp;&nbsp;&nbsp;  
            <form action="https://www.paypal.com/donate" method="post" target="_top">
              <input type="hidden" name="business" value="L7VEWD374RJ38" />
              <input type="hidden" name="no_recurring" value="0" />
              <input type="hidden" name="item_name" value="Help me dedicate more time to developing this application and keep it free." />
              <input type="hidden" name="currency_code" value="CAD" />
              <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
              <img alt="" border="0" src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
            </form>
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

