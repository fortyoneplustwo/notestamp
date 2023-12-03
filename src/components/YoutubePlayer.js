import React, { useRef, useState, useEffect } from 'react';
import BackButton from './BackButton';
import '../MediaComponent.css'
import '../YoutubePlayer.css'
import '../Button.css'

const YoutubePlayer = React.forwardRef((props, ref) => {
  const { closeComponent } = props
  let playerInstanceRef = useRef(null)
  let currentVideoRef = useRef(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////
  
  useEffect(() => {
  // Parent component can use this controller using ref
    const controller = {
      getState: function (data = null) {
        return currentVideoRef.current.getCurrentTime()
      },
      setState: function (newState) {
        currentVideoRef.current.seekTo(newState, true)
      }
    } 
    ref.current = controller
  }, [ref])

  ////////////////////////////////
  /// Initialize youtube player //
  ////////////////////////////////

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
    // Pass player object as a ref so it can be controlled by the parent
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
    <div className='media-component-container'>
      <div className='back-btn-container'><BackButton handler={closeComponent} /></div>
      <div className='youtube-media-container'>
        <div className='form-container'>
          <form onSubmit={handleSubmitUrl} className='form'>
            <input
              type="text"
              name="inputField"
              placeholder="Enter YouTube link"
              className='form-input'
            />
            <button type="submit" className='searchbar-submit-btn'>Play</button>
          </form>
        </div>
        <div id="youtube-player"></div>
      </div>
    </div>
  )
})

export default YoutubePlayer
