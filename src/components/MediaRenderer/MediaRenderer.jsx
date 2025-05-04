import React, { Suspense } from 'react'
import { defaultMediaConfig as mediaConfig } from '@/config'
import { useProjectContext } from '../../context/ProjectContext'
import Loading from '../Screens/Loading/Loading'

const mediaImports = import.meta.glob(`./media/*/index.jsx`)
const lazyLoadedMediaComponents = new Map()
mediaConfig.forEach(({ type, dir }) => {
  const path = `./media/${dir}/index.jsx`
  if (path in mediaImports) {
    lazyLoadedMediaComponents.set(type, React.lazy(mediaImports[path]))
  }
})

const MediaRenderer = ({ ref, metadata }) => {
  const { setMediaRef } = useProjectContext()

  const MediaComponent = metadata?.type
    ? lazyLoadedMediaComponents.get(metadata.type)
    : null

  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={<Loading />}>
        <MediaComponent
          ref={(node) => {
            ref(node)
            setMediaRef(node)

            return () => {
              ref(null)
              setMediaRef(null)
            }
          }}
          {...metadata}
        />
      </Suspense>
    </div>
  )
}

export default MediaRenderer
