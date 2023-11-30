import React, { useEffect } from 'react'
import '../MediaComponent.css'
import '../AudioPlayer.css'
import BackButton from './BackButton'

const AudioPlayer = React.forwardRef((props, ref) => {
  const { src, closeComponent } = props

  useEffect(() => {
    ref.current.src = src
  })

  return (
    <div className='media-component-container'>
      <div className='back-btn-container'><BackButton handler={closeComponent} /></div>
      <div className='audio-media-container'>
        <audio controls ref={ref} />
        <a href={src} download="audio_recording.ogg" className='audio-download-link'>Download</a>
      </div>
    </div>
  )
})

export default AudioPlayer
