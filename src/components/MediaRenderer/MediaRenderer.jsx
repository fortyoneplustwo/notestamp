import React from "react"
import { defaultMediaConfig as mediaConfig } from "@/config"
import { useProjectContext } from "../../context/ProjectContext"
import Loading from "../Screens/Loading/Loading"
import YoutubePlayer from "./media/YoutubePlayer"
import AudioPlayer from "./media/AudioPlayer"
import AudioRecorder from "./media/AudioRecorder"
import PdfReader from "./media/PdfReader"
import { appLayoutRoute } from "@/App"
import {
  createRoute,
  Outlet,
  useLoaderData,
  useMatch,
} from "@tanstack/react-router"
import { fetchMetadata } from "@/utils/fetchMetadata"
import { invalidateForward, mediaToForward, shouldForwardMedia } from "@/utils/switchMedia"

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

export const mediaLayoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  id: "_mediaLayout",
  component: MediaRenderer,
})

export const mediaIdRoute = createRoute({
  getParentRoute: () => mediaLayoutRoute,
  path: "$mediaId",
  loader: ({ params }) => {
    const metadata = fetchMetadata(params.mediaId)
    // TODO: case: saved project -> override with project's metadata
    // Add fetchMetadataById to router context on before load
    // then call in route's loader
    if (shouldForwardMedia) {
      const merged = { ...metadata, ...mediaToForward }
      invalidateForward()
      return merged
    }
    // NOTE: May want to load media here
    return metadata
  },
  pendingComponent: () => Loading,
  notFoundComponent: () => <>404: Oops! This media component does not exist.</>,
  errorComponent: () => <>Error</>,
  component: Media,
})

function MediaRenderer() {
  return (
    <div className="h-full overflow-hidden">
      <Outlet />
    </div>
  )
}

function Media() {
  const match = useMatch({ strict: false })
  const metadata = useLoaderData({})
  const { setMediaRef } = useProjectContext()
  const Comp = mediaComponentsMap.get(match.params.mediaId)

  // TODO: read (tanstack)query data here
  // then pass to props

  if (!Comp) {
    return (
      <div className="h-full items-center justify-center">
        <p>Oops! This media component does not exist.</p>
      </div>
    )
  }

  return (
    <Comp
      ref={node => {
        setMediaRef(node)
        return () => {
          setMediaRef(null)
        }
      }}
      {...metadata}
    />
  )
}

export default MediaRenderer
