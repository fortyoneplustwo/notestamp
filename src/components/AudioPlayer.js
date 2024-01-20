import React, { useEffect, useRef, useState } from 'react'
import '../MediaComponent.css'
import '../AudioPlayer.css'

const AudioPlayer = React.forwardRef((props, ref) => {
  const { src } = props
  const playerRef = useRef(null)
  
  const handleOpenAudioFile = file => {
    console.log(file)
    playerRef.current.src = window.URL.createObjectURL(file)
  }

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
    if (src) playerRef.current.src = src
  }, [src])

  return (
      <div className='audio-media-container' >
        <div className='back-btn-container'>
          {!src && 
            <form onChange={ e => playerRef.current.src = window.URL.createObjectURL(e.target.files[0]) }>
              <input type='file' accept='audio/*' />
            </form>
          }
        </div>
        <audio controls ref={playerRef} />
      </div>
  )
})

export default AudioPlayer
