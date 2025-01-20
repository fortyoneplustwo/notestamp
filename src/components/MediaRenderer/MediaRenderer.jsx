import React, { Suspense } from 'react'
import { myMediaComponents } from './config'
import { useProjectContext } from '../../context/ProjectContext'
import Loading from '../Screens/Loading/Loading'

// Import default components
const mediaComponentMap = {
  audio: React.lazy(() => import('./media/AudioPlayer/AudioPlayer')),
  pdf: React.lazy(() => import('./media/PdfReader/PdfReader')),
  youtube: React.lazy(() => import('./media/YoutubePlayer/YoutubePlayer')),
  recorder: React.lazy(() => import('./media/AudioRecorder/AudioRecorder'))
}

// Import custom components
const allMediaComponents = import.meta.glob(`./media/**/*.jsx`)
const customMediaComponents = {}
myMediaComponents.forEach(obj => {
  const regex = new RegExp(`${obj.path.slice(2)}`)
  const [_, component] = Object.entries(allMediaComponents).find(([key, _]) => regex.test(key))
  if (component) customMediaComponents[obj.type] = React.lazy(component)
})

// merge default and custom components
Object.assign(mediaComponentMap, customMediaComponents)

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
