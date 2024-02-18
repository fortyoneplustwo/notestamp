import React, { useEffect, useImperativeHandle, useRef } from 'react'
import { WithToolbar, Toolbar } from './LeftPaneComponents'
import '../Background.css'
import { formatTime } from '../modules/formatTime'

const AudioPlayer = React.forwardRef((props, ref) => {
  const { src } = props
  const playerRef = useRef(null)

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        if (playerRef.current) {
          const currentTime = playerRef.current.currentTime
          return { 
            label: formatTime(currentTime),
            value: currentTime ? currentTime : null 
          }
        } else {
          return null
        }
      },
      setState: newState => {
        playerRef.current.currentTime = newState
        playerRef.current.play()
      },
      getMetada: () => {
        return playerRef.current
          ? { ...props, src: playerRef.current.src }
          : null
      } 
    } 
  }, [props])


  ////////////////////////////////
  /// Initialize player //////////
  ////////////////////////////////

  useEffect(() => {
    if (src) playerRef.current.src = src
  }, [src])

  return (
      <WithToolbar>
        <Toolbar>
          <form style={{ color: 'black' }} onChange={ e => {
            playerRef.current.src = window.URL.createObjectURL(e.target.files[0])
          }}>
            <input type='file' accept='audio/*' />
          </form>
        </Toolbar>
        <div 
          className='diagonal-background' 
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1' }}>
          <audio style={{ colorScheme: 'dark' }} controls ref={playerRef} />
        </div>
      </WithToolbar>
  )
})

export default AudioPlayer
