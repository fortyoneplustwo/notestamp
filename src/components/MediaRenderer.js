import React, { Suspense } from 'react'
import { myMediaComponents } from './NonCoreMediaComponents'
import { useProjectContext } from './context/ProjectContext'

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
  const { type } = props
  const MediaComponentToRender = mediaComponentMap[type]
  const { setMediaRef } = useProjectContext()

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MediaComponentToRender ref={(node) => {
          ref(node)
          setMediaRef(node)

          return () => {
            setMediaRef(null)
          }
        }} {...props}  />
      </Suspense>
    </div>
  )
})

export default MediaRenderer
