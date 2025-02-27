import React, { useEffect, useImperativeHandle } from 'react'
import { EventEmitter } from '../../../../utils/EventEmitter'
import '../../style/Background.css'
import { formatTime } from '../../utils/formatTime'
import { Mic, Square, Pause } from 'lucide-react'
import { Toolbar } from '../../components/Toolbar'
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer"
import { MediaToolbarButton } from '@/components/Button/Button'

// Variables needed to calculate timestamp.
// Declared outside of component so they remain unaffected by re-renders.
// Initialized below when component mounts.
let dateWhenRecLastActive
let dateWhenRecLastInactive
let recDuration

const AudioRecorder = React.forwardRef((props, ref) => {
  const recorderControls = useVoiceVisualizer()
  const {
    recordedBlob,
    error,
    mediaRecorder,
    isRecordingInProgress,
    stopRecording,
    startRecording,
    togglePauseResume,
    isPausedRecording,
  } = recorderControls;

  useEffect(() => {
    if (!recordedBlob) return
    EventEmitter.dispatch('open-media-with-src', { type: 'audio', src: recordedBlob })
  }, [recordedBlob, error])

  useEffect(() => {
    if (!error) return;
    console.error(error)
  }, [error])

  useEffect(() => {
    if (!mediaRecorder) return

    mediaRecorder.onstart = () => dateWhenRecLastActive = new Date()
    mediaRecorder.onresume = () => dateWhenRecLastActive = new Date()
    mediaRecorder.onpause = () => {
      dateWhenRecLastInactive = new Date()
      recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
    }
    mediaRecorder.onstop = () => {
      dateWhenRecLastInactive = new Date()
      recDuration += (dateWhenRecLastInactive - dateWhenRecLastActive)
    }
  }, [mediaRecorder]);

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


  useEffect(() => { 
    dateWhenRecLastActive = new Date()
    dateWhenRecLastInactive = dateWhenRecLastActive
    recDuration = 0
  }, [])

  return (
    <div className='flex flex-col h-full'>
      <Toolbar className="flex justify-center gap-2">
        {!isRecordingInProgress && (
          <MediaToolbarButton 
            className="record-btn"
            variant="outline"
            title="Record" 
            onClick={startRecording}
          >
            <Mic /> Record
          </MediaToolbarButton>
        )}
        {isRecordingInProgress && !isPausedRecording && (
          <MediaToolbarButton 
            variant="outline"
            title="Pause" 
            onClick={togglePauseResume}
          >
            <Pause /> Pause
          </MediaToolbarButton>
        )}
        {isRecordingInProgress && isPausedRecording && (
          <MediaToolbarButton 
            variant="outline"
            title="Resume" 
            onClick={togglePauseResume}
          >
            <Mic /> Resume
          </MediaToolbarButton>
        )}
        <MediaToolbarButton 
          className="stop-btn"
          disabled={!isRecordingInProgress}
          variant="outline"
          title="Stop" 
          onClick={stopRecording}
        >
          <Square /> Stop
        </MediaToolbarButton>
      </Toolbar>

      <div className="diagonal-background flex items-center w-full h-full">
        <div className="w-full">
          <VoiceVisualizer 
            controls={recorderControls} 
            isControlPanelShown={false}
            mainBarColor="orangered"
          />
        </div>
      </div>
    </div>
  )
})

export default AudioRecorder
