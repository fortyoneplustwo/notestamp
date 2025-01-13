import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useGetProjectMedia } from '../../../../hooks/useReadData'
import { Toolbar } from '../../components/Toolbar'
import '../../style/Background.css'
import { formatTime } from '../../utils/formatTime'
import { Input } from '@/components/ui/input'

const AudioPlayer = React.forwardRef((props, ref) => {
  const [audio, setAudio] = useState(null)
  const playerRef = useRef(null)
  const { data: savedAudio, fetchById: fetchAudioById } = useGetProjectMedia()

  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        if (playerRef.current) {
          const currentTime = playerRef.current.currentTime
          return { 
            label: currentTime ? formatTime(currentTime) : null,
            value: currentTime
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
              mimetype: audio?.type || props.mimetype,
              src: ''
            }
          : null
      },
      getMedia: () => { return audio }
    } 
  }, [props, audio])

  useEffect(() => {
    if (props.title) {
      fetchAudioById(props.title)
    }
  }, [props.title, fetchAudioById])

  useEffect(() => {
    if (savedAudio) {
      playerRef.current.src = window.URL.createObjectURL(savedAudio)
      playerRef.current.type = props.mimetype
    }
  }, [savedAudio, props.mimetype])

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
    <div className="flex flex-col h-full">
      {(!props.src && !savedAudio) &&
        <Toolbar>
          <form 
            className="flex w-full max-w-sm items-center gap-1.5"
            onChange={(e) => {
              playerRef.current.src = window.URL.createObjectURL(e.target.files[0])
              setAudio(e.target.files[0])
            }} 
          >
            <Input className="h-6 p-0 text-xs" type="file" accept="audio/*" />
          </form>
        </Toolbar>
      }
      <div className='diagonal-background flex h-full justify-center items-center'>
        <audio style={{ colorScheme: 'dark' }} controls ref={playerRef} />
      </div>
    </div>
  )
})

export default AudioPlayer
