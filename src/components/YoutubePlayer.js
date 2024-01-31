import React, { useRef, useState, useEffect } from 'react';
import '../MediaComponent.css'
import '../YoutubePlayer.css'
import '../Button.css'
import '../Background.css'
import { Icon } from './Toolbar';
import { WithToolbar, Toolbar } from './MediaComponents'

const YoutubePlayer = React.forwardRef(({ src }, ref) => {
  let playerInstanceRef = useRef(null)
  let currentVideoRef = useRef(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useEffect(() => {
  // Parent component can use this controller using ref
    const controller = {
      getState: function (_) {
        return {
          value: currentVideoRef.current ? currentVideoRef.current.getCurrentTime() : null,
          type: 'youtube',
          src: youtubeUrl
        }
      },
      setState: function (newState) {
        if (currentVideoRef) currentVideoRef.current.seekTo(newState, true)
      }
    } 
    ref.current = controller
  }, [youtubeUrl, ref])

  ////////////////////////////////
  /// Initialize youtube player //
  ////////////////////////////////

  useEffect(() => {
    setYoutubeUrl(src)
  }, [src])

  const onYouTubeIframeAPIReady = () => {
    // Need to destroy existing player instance before loading a new video
    if (playerInstanceRef.current) playerInstanceRef.current.destroy();

    playerInstanceRef.current = new window.YT.Player('youtube-player', {
      width: '100%',
      videoId: extractVideoId(youtubeUrl), // Replace with a valid video ID
      playerVars: {
        'playsInline': 1,
        'autoplay': 1
        // Any additional parameters (e.g., autoplay, controls, etc.)
      },
      events: {
        // Event handlers (e.g., onReady, onStateChange)
        onReady: onPlayerReady
      },
    });
  };

  function onPlayerReady(event) {
    // Player is ready to be controlled
    // You can use 'event.target' to access the player object
    currentVideoRef.current = event.target
  }

  // Load the YouTube API script if not already loaded
    if (window.YT && window.YT.Player) {  
      onYouTubeIframeAPIReady();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

  ////////////////////////////////
  /// Helpers ////////////////////
  ////////////////////////////////
  
  // extract videoID from youtube url
  function extractVideoId(url) {
    const regex = /[?&]v=([^#&]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleSubmitUrl = event => {
    event.preventDefault()
    setYoutubeUrl(event.target.elements.inputField.value)
    event.target.elements.inputField.value = ''
  }

  ////////////////////////////////
  /// JSX ////////////////////////
  ////////////////////////////////

  return (
      <WithToolbar>
        <Toolbar style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmitUrl}>
            <input
              type="text"
              name="inputField"
              placeholder="Enter YouTube link"
              style={{ width: '400px' }}
            />
            <button type='submit' style={{ marginLeft: '3px' }}>
              Play
            </button>
          </form>
        </Toolbar>
        <div 
          className='grid-background' 
          style={{
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: '1' 
          }}>
          <div id="youtube-player"></div>
        </div>
      </WithToolbar>
  )
})

export default YoutubePlayer
