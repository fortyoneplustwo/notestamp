import React, { useImperativeHandle, useRef } from 'react'
import YouTube from 'react-youtube'
import '../Background.css'
import { WithToolbar, Toolbar } from './LeftPaneComponents'
import { formatTime } from '../modules/formatTime'

const YoutubePlayer = React.forwardRef((props, ref) => {
  const player = useRef(null)

  const onPlayerReady = event => {
    player.current = event.target
  }

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        if (player.current) {
          const currentTime = player.current.getCurrentTime()
          return { 
            label: formatTime(currentTime),
            value: currentTime !== null ? currentTime : null
          }
        } else {
          return null
        }
      },
      setState: (newState) => {
        if (player.current) player.current.seekTo(newState, true)
      },
      getMetadata: () => {
        return player.current
          ? {
            ...props,
            src: withoutTimeData(player.current.getVideoUrl()),
            mimetype: ''
          }
          : null
      },
      getMedia: () => { return null }
    }
  }, [props])

  ////////////////////////////////
  /// Methods ////////////////////
  ////////////////////////////////
  
  // remove time data from url
  const withoutTimeData = url => {
    return url.replace(/[?&]t=\d+m?\d*s?/i, '')
  }
  
  // extract videoID from youtube url
  const extractVideoId = url => {
    if (!url) return ''
    const regex = /[?&]v=([^#&]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleSubmitUrl = event => {
    event.preventDefault()
    player.current.loadVideoById(extractVideoId(event.target.elements.inputField.value))
    event.target.elements.inputField.value = ''
  }

  ////////////////////////////////
  /// JSX ////////////////////////
  ////////////////////////////////

  return (
    <WithToolbar>
      { !props.src &&
        <Toolbar style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmitUrl}>
            <input
              type="text"
              name="inputField"
              placeholder="Enter YouTube link"
              style={{ width: '400px' }}
              className="text-sm border rounded px-1"
            />
            <button type='submit' className='text-sm ml-1 px-1 border rounded'>
              Play
            </button>
          </form>
        </Toolbar>
      }
      <div 
        className='diagonal-background' 
        style={{
          display: 'flex',
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: '1' 
        }}>
        <YouTube style={{ width: '100%'}} 
          videoId={extractVideoId(props.src)} 
          opts={{ width: '100%'}} 
          onReady={onPlayerReady} 
        />
      </div>
    </WithToolbar>
  )
})

export default YoutubePlayer
