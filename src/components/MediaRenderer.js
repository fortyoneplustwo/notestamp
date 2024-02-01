import React, {useEffect, useRef} from 'react'
import AudioPlayer from './AudioPlayer'
import PdfReader from './PdfReader'
import YoutubePlayer from './YoutubePlayer'
import AudioRecorder from './AudioRecorder'

const MediaRenderer = React.forwardRef(({ type=null, src=null}, ref) => {
  const controller = useRef(null)
  
  useEffect(() => {
    ref.current = controller.current
  }, [ref, type, src, controller])

  return (
    <div style={{ height: '100%' }}>
      {type === 'youtube' && <YoutubePlayer ref={controller} src={src} />}
      {type === 'audio' && <AudioPlayer ref={controller} src={src} />}
      {type === 'pdf' && <PdfReader ref={controller} src={src} />}
      {type === 'recorder' && <AudioRecorder ref={controller} />}
    </div>
  )
})

export default MediaRenderer
