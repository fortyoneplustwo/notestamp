import React, { useRef, useState, useEffect } from 'react'
import { EventEmitter } from './EventEmitter.js'
import '../MediaComponent.css'
import '../Background.css'
import { Icon } from './Toolbar.js'

// Variables needed to calculate timestamp
// Defined outside of component to prevent reset on re-renders
let dateWhenRecLastActive = new Date()
let dateWhenRecLastInactive = dateWhenRecLastActive
let recDuration = 0

const AudioRecorder = React.forwardRef((props, ref) => {
  const mediaRecorder = useRef(null)
  const chunks = useRef(null)

  const recordButtonRef = useRef(null)
  const stopButtonRef = useRef(null)

  const [recordButtonText, setRecordButtonText] = useState('Record')
  const [recordButtonIcon, setRecordButtonIcon] = useState('radio_button_checked')
  const [recordButtonClassName, setRecordButtonClassname] = useState('')
  const [stopButtonDisabled, setStopButtonDisabled] = useState(true)
  const [showRecControls, setShowRecControls] = useState(true)

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useEffect(() => {
  // Parent component can use this controller using ref
    const controller = {
      getState: function (data) {
        const dateStampDataRequested = data
        let timestamp = null
        // If statement checks if the recorder was stopped while still recording
        if (dateWhenRecLastActive > dateWhenRecLastInactive) {
          timestamp = recDuration + (dateStampDataRequested - dateWhenRecLastActive)
        } else {
          timestamp = recDuration
        }
        timestamp = Math.floor(timestamp / 1000)
        return timestamp
      },
      setState: function (_) {}
    } 
    ref.current = controller
  }, [ref])

  ////////////////////////////////
  /// Initialize recorder  ///////
  ////////////////////////////////

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
            dateWhenRecLastActive = new Date()
          }
          // handle ondataavailable event
          mediaRecorder.current.ondataavailable = (e) => {
            chunks.current.push(e.data)
          }
          // handle onresume event
          mediaRecorder.current.onresume = () => {
            dateWhenRecLastActive = new Date()
            mediaRecorder.current.requestData()
          }
          // handle onpause event
          mediaRecorder.current.onpause = () => {
            dateWhenRecLastInactive = new Date()
            recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
          }
          // handle onstop event
          mediaRecorder.current.onstop = () => {
            dateWhenRecLastInactive = new Date()
            recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
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
      setRecordButtonClassname('blink')
    } else if (mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause()
      setRecordButtonText('Resume')
      setRecordButtonClassname('')
    } else {
      mediaRecorder.current.resume()
      setRecordButtonText('Pause')
      setRecordButtonClassname('blink')
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
      <div className='grid-background'
        style={{ display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexGrow: '1',
          gap: '0.5em'
      }}>
        {showRecControls 
          && <button className='recorder-btn' 
                ref={recordButtonRef} 
                onClick={toggleRecord}
              >
              <Icon className={recordButtonClassName}>{recordButtonIcon}</Icon>
              <span style={{ display: 'inline-flex',
                justifyContent: 'center',
                width: '5em' 
              }}>
                {recordButtonText}
              </span>
          </button>
        }
        {showRecControls 
          && <button ref={stopButtonRef} 
                className='recorder-btn' 
                style={{ background: 'gray' }}
                disabled={stopButtonDisabled} 
                onClick={toggleStop}
              >
              <Icon>stop_circle</Icon>
              <span style={{ display: 'inline-flex',
                justifyContent: 'center',
                width: '5em' 
              }}>
                Stop
              </span>
          </button>
        }
      </div>
  )
})

export default AudioRecorder
