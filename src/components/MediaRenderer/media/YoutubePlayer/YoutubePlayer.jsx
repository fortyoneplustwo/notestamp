import React, { useEffect, useImperativeHandle, useRef } from 'react'
import YouTube from 'react-youtube'
import '../../style/Background.css'
import { WithToolbar, Toolbar } from '../../components/Toolbar'
import { formatTime } from '../../utils/formatTime'
import { Input } from '@/components/ui/input'
import { DefaultButton, MediaToolbarButton } from '@/components/Button/Button'

const YoutubePlayer = React.forwardRef((props, ref) => {
  const player = useRef(null)

  const onPlayerReady = event => {
    player.current = event.target
  }

  useEffect(() => {
    return () => {
      if (player.current) {
        player.current = null;
      }
    };
  }, []);

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
        return {
            ...props,
            src: withoutTimeData(player.current?.getVideoUrl()),
            mimetype: ''
          }
      },
      getMedia: () => { return null }
    }
  }, [props])

  ////////////////////////////////
  /// Methods ////////////////////
  ////////////////////////////////
  
  // remove time data from url
  const withoutTimeData = url => {
    if (!url) { return "" }
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
    player.current?.loadVideoById(extractVideoId(event.target[0].value))
  }

  ////////////////////////////////
  /// JSX ////////////////////////
  ////////////////////////////////

  return (
    <WithToolbar>
      {!props.src &&
        <Toolbar style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmitUrl} className="flex w-full max-w-md items-center space-x-2">
            <Input className="h-6" type="url" placeholder="Enter youtube video url" />
            <MediaToolbarButton type="submit">Play</MediaToolbarButton>
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
