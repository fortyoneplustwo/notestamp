import React, { useEffect, useRef } from 'react'
import '../MediaComponent.css'
import '../AudioPlayer.css'

const AudioPlayer = React.forwardRef((props, ref) => {
  const { src } = props
  const playerRef = useRef(null)

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useEffect(() => {
    // Parent component can use this controller using ref
    const controller = {
      getState: function (data = null) {
        return playerRef.current.currentTime
      },
      setState: function (newState) {
        playerRef.current.currentTime = newState
        playerRef.current.play()
      }
    } 
    ref.current = controller
  }, [ref])


  ////////////////////////////////
  /// Initialize player //////////
  ////////////////////////////////

  useEffect(() => {
    playerRef.current.src = src
  }, [src])

  return (
      <div className='audio-media-container'>
        <audio controls ref={playerRef} />
        <a href={src} download="audio_recording.ogg" className='audio-download-link'>Download</a>
      </div>
  )
})

export default AudioPlayer
