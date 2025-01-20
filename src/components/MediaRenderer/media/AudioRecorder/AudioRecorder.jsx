import React, { useRef, useState, useEffect, useImperativeHandle } from 'react'
import { EventEmitter } from '../../../../utils/EventEmitter'
import '../../style/Background.css'
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

  useImperativeHandle(ref, () => {
    return {
      getState: data => {
        const dateStampDataRequested = data
        let timestamp = null
        if (dateWhenRecLastActive > dateWhenRecLastInactive) {
          timestamp = recDuration + (dateStampDataRequested - dateWhenRecLastActive)
        } else {
          timestamp = recDuration
        }
        timestamp = Math.floor(timestamp / 1000)
        return {
          label: formatTime(timestamp),
          value: timestamp
        }
      },
      getMetadata: () => { return { ...props } },
    } 
  }, [props])

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

  const toggleRecord = () => {
    if (mediaRecorder.current.state === 'inactive') {
      mediaRecorder.current.start()
      setStopButtonDisabled(false)
      setRecordButtonText('Pause')
      setRecordButtonClassname('animate-pulse')
    } else if (mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause()
      setRecordButtonText('Resume')
      setRecordButtonClassname('')
    } else {
      mediaRecorder.current.resume()
      setRecordButtonText('Pause')
      setRecordButtonClassname('animate-pulse')
    }
  }

  const toggleStop = () => {
    mediaRecorder.current.stop()
  }

  return (
    <div className='diagonal-background flex justify-center items-center h-full gap-2'>
      <DefaultButton
        size="lg"
        className='record-btn font-bold text-white bg-[orangered] hover:bg-[orangered]/90'
        ref={recordButtonRef}
        onClick={toggleRecord}
      >
        <RadiobuttonIcon className={recordButtonClassName} />
        {recordButtonText}
      </DefaultButton>
      <DefaultButton
        variant="default"
        size="lg"
        className='font-bold stop-btn'
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
