import React, { useEffect, useRef, useState } from 'react'
import { WithToolbar, Toolbar } from './MediaComponents'
import '../MediaComponent.css'
import '../Background.css'

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
    if (src) playerRef.current.src = src
  }, [src])

  return (
      <WithToolbar>
        { !src
          && <Toolbar>
            <form style={{ color: 'black' }} onChange={ e => {
              playerRef.current.src = window.URL.createObjectURL(e.target.files[0])
            }}>
              <input type='file' accept='audio/*' />
            </form>
          </Toolbar>
        }
        <div 
          className='grid-background' 
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1' }}>
          <audio style={{ colorScheme: 'dark' }} controls ref={playerRef} />
        </div>
      </WithToolbar>
  )
})

export default AudioPlayer
