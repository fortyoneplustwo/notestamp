import React, { useEffect } from 'react'

const AudioPlayer = React.forwardRef((props, ref) => {
  const { src } = props

  useEffect(() => {
    ref.current.src = src
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <audio controls ref={ref} />
      <a href={src} download="audio_recording.ogg" style={{ color: 'white', fontSize: 'small' }}>download</a>
    </div>
  )
})

export default AudioPlayer
