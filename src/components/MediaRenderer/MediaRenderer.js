import React, { Suspense } from 'react'
import { myMediaComponents } from './config'
import { useProjectContext } from '../../context/ProjectContext'
import Loading from '../Screens/Loading/Loading'

// Import core components
const mediaComponentMap = {
  audio: React.lazy(() => import('./media/AudioPlayer/AudioPlayer')),
  pdf: React.lazy(() => import('./media/PdfReader/PdfReader')),
  youtube: React.lazy(() => import('./media/YoutubePlayer/YoutubePlayer')),
  recorder: React.lazy(() => import('./media/AudioRecorder/AudioRecorder'))
}

// Import non-core components
myMediaComponents.forEach(obj => {
  const key = obj.type
  const value = React.lazy(() => import(`${obj.path}`))
  mediaComponentMap[key] = value
})

const MediaRenderer = React.forwardRef(({ metadata, loading }, ref) => {

  const { setMediaRef } = useProjectContext()
  let MediaComponent = null

  if (!metadata) {
    return (
      <Loading loading={loading} />
    )
  }

  MediaComponent = metadata.type ? mediaComponentMap[metadata.type] : null

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MediaComponent ref={(node) => {
          ref(node)
          setMediaRef(node)

          return () => {
            setMediaRef(null)
          }
        }} {...metadata}  />
      </Suspense>
    </div>
  )
})

export default MediaRenderer
