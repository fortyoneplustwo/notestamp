import React, {useEffect, useRef, Suspense} from 'react'
import { myMediaComponents } from './NonCoreMediaComponents'

// Import core components
const mediaComponentMap = {
  audio: React.lazy(() => import('./AudioPlayer')),
  pdf: React.lazy(() => import('./PdfReader')),
  youtube: React.lazy(() => import('./YoutubePlayer')),
  recorder: React.lazy(() => import('./AudioRecorder'))
}

// Import non-core components
myMediaComponents.forEach(obj => {
  const key = obj.type
  const value = React.lazy(() => import(`${obj.path}`))
  mediaComponentMap[key] = value
})

const MediaRenderer = React.forwardRef((props, ref) => {
  const { type, src } = props
  const controller = useRef(null)
  const MediaComponentToRender = mediaComponentMap[type]

  useEffect(() => {
    ref.current = controller.current
  }, [ref, type, src, controller])

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MediaComponentToRender ref={ref} {...props}  />
      </Suspense>
    </div>
  )
})

export default MediaRenderer
