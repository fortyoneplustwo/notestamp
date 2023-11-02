import React, { useRef, useState, useEffect } from 'react'
import { EventEmitter } from './EventEmitter.js'

const AudioRecorder = () => {
  const mediaRecorder = useRef(null)
  const chunks = useRef(null)

  const recordButtonRef = useRef(null)
  const stopButtonRef = useRef(null)

  const [recordButtonText, setRecordButtonText] = useState('Record')
  const [stopButtonDisabled, setStopButtonDisabled] = useState(true)
  const [showRecControls, setShowRecControls] = useState(true)

  const initPlayer = () =>{
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !mediaRecorder.current) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, })
        // Success callback: Register event listeners
        .then((stream) => {
          mediaRecorder.current = new MediaRecorder(stream)
          // handle onstart event
          mediaRecorder.current.onstart = () => {
            chunks.current = []
            EventEmitter.dispatch('recorder-active', new Date())
          }
          // handle ondataavailable event
          mediaRecorder.current.ondataavailable = (e) => {
            chunks.current.push(e.data)
          }
          // handle onresume event
          mediaRecorder.current.onresume = () => {
            EventEmitter.dispatch('recorder-active', new Date())
            mediaRecorder.current.requestData()
          }
          // handle onpause event
          mediaRecorder.current.onpause = () => {
            EventEmitter.dispatch('recorder-inactive', new Date())
          }
          // handle onstop event
          mediaRecorder.current.onstop = () => {
            EventEmitter.dispatch('recorder-inactive', new Date())
            const blob = new Blob(chunks.current, {type: "audio/ogg; codecs=opus"})
            const audioURL = window.URL.createObjectURL(blob)
            EventEmitter.dispatch('recorder-stopped', audioURL)
          }
        })
        // Error callback
        .catch(function (err) {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }

  useEffect(() => { initPlayer() }, [])

  ////////////////////////////////
  ///  Methods  //////////////////
  ////////////////////////////////
  
  const toggleRecord = () => {
    if(mediaRecorder.current.state === 'inactive') {
      mediaRecorder.current.start()
      setStopButtonDisabled(false)
      setRecordButtonText('Pause')
    } else if (mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause()
      setRecordButtonText('Resume')
    } else {
      mediaRecorder.current.resume()
      setRecordButtonText('Pause')
    }
  }

  const toggleStop = () => {
    mediaRecorder.current.stop()
    setShowRecControls(false)
  }

  ////////////////////////////////
  ///  JSX  //////////////////////
  ////////////////////////////////

  return (
    <div style={{ display: 'flex', gap: '5px'}}>
      {showRecControls && <button ref={recordButtonRef} onClick={toggleRecord}>{recordButtonText}</button>}
      {showRecControls && <button ref={stopButtonRef} disabled={stopButtonDisabled} onClick={toggleStop}>Stop</button>}
    </div>
  )
}

export default AudioRecorder
