import React, {useEffect, useRef} from 'react'
import AudioPlayer from './AudioPlayer'
import PdfReader from './PdfReader'
import YoutubePlayer from './YoutubePlayer'
import BackButton from './BackButton'
import AudioRecorder from './AudioRecorder'
import '../MediaComponent.css'
import '../Button.css'

const Media = React.forwardRef(({ type=null, src=null, onClose}, ref) => {
  const controller = useRef(null)
  
  useEffect(() => {
    ref.current = controller.current
  }, [ref, type, src, controller])

  return (
    <div className='media-component-container'>
      <div className='back-btn-container'>
        <BackButton handler={onClose} />
      </div>
      {type === 'youtube' && <YoutubePlayer ref={controller} src={src} />}
      {type === 'audio' && <AudioPlayer ref={controller} src={src} />}
      {type === 'pdf' && <PdfReader ref={controller} src={src} />}
      {type === 'recorder' && <AudioRecorder ref={controller} />}
    </div>
  )
})

export default Media
