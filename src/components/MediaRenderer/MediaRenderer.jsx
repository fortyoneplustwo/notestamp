import React from "react"
import { defaultMediaConfig as mediaConfig } from "@/config"
import { useProjectContext } from "../../context/ProjectContext"
import Loading from "../Screens/Loading/Loading"
import YoutubePlayer from "./media/YoutubePlayer"
import AudioPlayer from "./media/AudioPlayer"
import AudioRecorder from "./media/AudioRecorder"
import PdfReader from "./media/PdfReader"
import { appLayoutRoute } from "@/App"
import { createRoute, Outlet, useLoaderData, useMatch } from "@tanstack/react-router"
import { fetchMetadata } from "@/utils/fetchMetadata"
import { localLayoutRoute } from "@/router"

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

export const localMediaLayoutRoute = createRoute({
  getParentRoute: () => localLayoutRoute,
  id: "_localMediaLayout",
  component: MediaRenderer,
})

export const localMediaIdRoute = createRoute({
  getParentRoute: () => localMediaLayoutRoute,
  path: "$mediaId",
  loader: ({ params }) => {
    return fetchMetadata(params.mediaId)
  },
  pendingComponent: () => Loading,
  notFoundComponent: () => <>404: Oops! This media component does not exist.</>,
  errorComponent: () => <>Error</>,
  component: Media,
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
    return fetchMetadata(params.mediaId)
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
