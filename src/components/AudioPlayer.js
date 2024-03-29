import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { WithToolbar, Toolbar } from './LeftPaneComponents'
import '../Background.css'
import { formatTime } from '../modules/formatTime'

const AudioPlayer = React.forwardRef((props, ref) => {
  const [audio, setAudio] = useState(null)
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
            label: currentTime ? formatTime(currentTime) : null,
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
      getMetadata: () => {
        return playerRef.current
          ? { 
            ...props,
            mimetype: audio?.type 
              || props.mimetype,
            src: ''
          }
          : null
      },
      getMedia: () => {
        return audio
      }
    } 
  }, [props, audio])


  ////////////////////////////////
  /// Initialize player //////////
  ////////////////////////////////

  useEffect(() => {
    if (props.src) {
      if (props.src instanceof Blob) {
        // Src could be a blob passed from the recorder
        // in which case this would be a new project
        playerRef.current.src = window.URL.createObjectURL(props.src)
        playerRef.current.type = props.src.type
        setAudio(props.src)
      } else { 
        // Otherwise src is an endpoint from which to stream the project audio
        // in which case this is an existing project
        playerRef.current.src = props.src
        playerRef.current.type = props.mimetype
      }
    }
  }, [props])

  return (
    <WithToolbar>
      { !props.src &&
        <Toolbar>
          <form style={{ color: 'black' }} onChange={ e => {
            playerRef.current.src = window.URL.createObjectURL(e.target.files[0])
            setAudio(e.target.files[0])
          }}>
            <input type='file' accept='audio/*' />
          </form>
        </Toolbar>
      }
      <div 
        className='diagonal-background' 
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1' }}
      >
        <audio style={{ colorScheme: 'dark' }} controls ref={playerRef} />
      </div>
    </WithToolbar>
  )
})

export default AudioPlayer
