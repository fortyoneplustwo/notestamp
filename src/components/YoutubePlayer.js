import React, {  useRef, useState } from 'react';

const YoutubePlayer = React.forwardRef((props, ref) => {
  let player = useRef(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  ////////////////////////////////
  /// initialize youtube player //
  ////////////////////////////////

  const onYouTubeIframeAPIReady = () => {
    // Need to destroy player ref before reassigning to a new link
    if (player.current) player.current.destroy();

    player.current = new window.YT.Player('youtube-player', {
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
    ref.current = event.target
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
    <>
      <div style={{ marginBottom: '10px', justifySelf: 'flex-start' }}>
        <form onSubmit={handleSubmitUrl}>
          <input
            type="text"
            name="inputField"
            placeholder="Enter youtube url"
          />
          <button type="submit">Go</button>
        </form>
      </div>
      <div id="youtube-player"></div>
    </>
  )
})

export default YoutubePlayer
