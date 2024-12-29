import React, { useRef, useState, useEffect, useImperativeHandle } from 'react'
import { EventEmitter } from '../../../../utils/EventEmitter'
import '../../style/Background.css'
import { Icon } from '../../../Editor/components/Toolbar'
import './Button.css'
import { formatTime } from '../../utils/formatTime'
import { DefaultButton } from '@/components/Button/Button'
import { RadiobuttonIcon } from '@radix-ui/react-icons'
import { CircleStop } from 'lucide-react'

// Variables needed to calculate timestamp.
// Declared outside of component so they remain unaffected by re-renders.
// Initialized below when component mounts.
let dateWhenRecLastActive
let dateWhenRecLastInactive
let recDuration

const AudioRecorder = React.forwardRef((props, ref) => {
  const mediaRecorder = useRef(null)
  const chunks = useRef(null)

  const recordButtonRef = useRef(null)
  const stopButtonRef = useRef(null)

  const [recordButtonText, setRecordButtonText] = useState('Record')
  const [recordButtonClassName, setRecordButtonClassname] = useState('')
  const [stopButtonDisabled, setStopButtonDisabled] = useState(true)

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useImperativeHandle(ref, () => {
    return {
      getState: data => {
        const dateStampDataRequested = data
        let timestamp = null
        // If-statement checks if the recorder was stopped while still recording
        if (dateWhenRecLastActive > dateWhenRecLastInactive) {
          timestamp = recDuration + (dateStampDataRequested - dateWhenRecLastActive)
        } else {
          timestamp = recDuration
        }
        timestamp = Math.floor(timestamp / 1000)
        return {
          label: formatTime(timestamp),
          value: timestamp ? timestamp : null
        }
      },
      setState: () => {},
      getMetadata: () => {return { ...props }},
      getMedia: () => {return null }
    } 
  }, [props])

  ////////////////////////////////
  /// Initialize recorder  ///////
  ////////////////////////////////

  const initPlayer = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !mediaRecorder.current) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, })
        // Success callback: Register event listeners
        .then((stream) => {
          mediaRecorder.current = new MediaRecorder(stream)
          mediaRecorder.current.onstart = () => {
            chunks.current = []
            dateWhenRecLastActive = new Date()
          }
          mediaRecorder.current.ondataavailable = (e) => {
            chunks.current.push(e.data)
          }
          mediaRecorder.current.onresume = () => {
            dateWhenRecLastActive = new Date()
            mediaRecorder.current.requestData()
          }
          mediaRecorder.current.onpause = () => {
            dateWhenRecLastInactive = new Date()
            recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
          }
          mediaRecorder.current.onstop = () => {
            dateWhenRecLastInactive = new Date()
            recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
            const blob = new Blob(chunks.current, {type: "audio/ogg"})
            EventEmitter.dispatch('open-media-with-src', { type: 'audio', src: blob })
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

  useEffect(() => { 
    dateWhenRecLastActive = new Date()
    dateWhenRecLastInactive = dateWhenRecLastActive
    recDuration = 0
    initPlayer() 
  }, [])

  ////////////////////////////////
  ///  Methods  //////////////////
  ////////////////////////////////
  
  const toggleRecord = () => {
    if (mediaRecorder.current.state === 'inactive') {
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
  }

  ////////////////////////////////
  ///  JSX  //////////////////////
  ////////////////////////////////

  return (
    <div className='diagonal-background'
      style={{ display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        gap: '0.5em'
    }}>
      <DefaultButton
        size="lg"
        className='font-bold text-white bg-[orangered] hover:bg-[orangered]/90'
        ref={recordButtonRef}
        onClick={toggleRecord}
      >
        <RadiobuttonIcon className={recordButtonClassName} />
        {recordButtonText}
      </DefaultButton>
      <DefaultButton
        variant="default"
        size="lg"
        className='font-bold'
        ref={stopButtonRef}
        disabled={stopButtonDisabled}
        onClick={toggleStop}
      >
        <CircleStop />
        Stop
      </DefaultButton>
    </div>
  )
})

export default AudioRecorder