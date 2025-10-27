import React, { Suspense } from "react"
import { defaultMediaConfig as mediaConfig } from "@/config"
import { useProjectContext } from "../../context/ProjectContext"
import Loading from "../Screens/Loading/Loading"
import YoutubePlayer from "./media/YoutubePlayer"
import AudioPlayer from "./media/AudioPlayer"
import AudioRecorder from "./media/AudioRecorder"
import PdfReader from "./media/PdfReader"

const globImports = import.meta.glob(`./media/*/index.jsx`)
const defaultMediaComponents = {
  youtube: YoutubePlayer,
  audio: AudioPlayer,
  recorder: AudioRecorder,
  pdf: PdfReader,
}
const mediaComponentsMap = new Map()
mediaConfig.forEach(({ type, dir }) => {
  const path = `./media/${dir}/index.jsx`
  if (type in defaultMediaComponents) {
    mediaComponentsMap.set(type, defaultMediaComponents[type])
  } else if (path in globImports) {
    mediaComponentsMap.set(type, React.lazy(globImports[path]))
  }
})

const MediaRenderer = ({ ref, metadata }) => {
  const { setMediaRef } = useProjectContext()

  const MediaComponent = metadata?.type
    ? mediaComponentsMap.get(metadata.type)
    : null

  if (!MediaComponent) {
    return (
      <div className="h-full items-center justify-center">
        <p>Oops! This media component does not exist.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={<Loading />}>
        <MediaComponent
          ref={node => {
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
