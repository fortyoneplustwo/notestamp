import React, { useEffect, useMemo } from "react"
import { defaultMediaConfig as mediaConfig } from "@/config"
import { editorRef, useProjectContext } from "../../context/ProjectContext"
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
  useRouteContext,
} from "@tanstack/react-router"
import { getProjectConfig } from "@/utils/getProjectConfig"
import {
  invalidateForward,
  mediaToForward,
  shouldForwardMedia,
} from "@/utils/switchMedia"
import {
  fetchMediaById,
  fetchMediaByUrl,
  fetchMetadata,
  fetchNotes,
} from "@/lib/fetch/api-read"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useContent } from "../Editor/hooks/useContent"
import { useAppContext } from "@/context/AppContext"
import { redirect } from "@tanstack/react-router"

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
  component: () => (
    <div className="h-full overflow-hidden">
      <Outlet />
    </div>
  ),
})

export const mediaIdRoute = createRoute({
  getParentRoute: () => mediaLayoutRoute,
  path: "/$mediaId/$",
  beforeLoad: ({ context: { queryClient }, params }) => {
    // TODO: move this part to params.parse ?
    let projectId = ""
    try {
      const decoded = decodeURI(params._splat)
      projectId = decoded
    } catch {
      throw Error("Invalid URL")
    }

    const { user, cwd } = useAppContext.getState()
    if (params._splat && (!user && !cwd)) {
      throw redirect({ to: "/" })
    }

    return {
      projectId,
      metadataQueryOptions: {
        queryKey: ["metadata", projectId],
        queryFn: () => fetchMetadata(projectId),
        enabled: !!projectId,
        initialData: () => {
          const { projects } = projectId
            ? queryClient.getQueryData(["projects"])
            : { projects: [] }
          const metadata = projects?.find(p => p.id === projectId)
          return metadata
        },
      },
      notesQueryOptions: {
        queryKey: ["notes", projectId],
        queryFn: () => fetchNotes(projectId),
        enabled: !!projectId,
      },
      mediaQueryOptions: {
        queryKey: ["media", projectId],
        queryFn: () => fetchMediaById(projectId),
        staleTime: Infinity,
      },
    }
  },
  loader: async ({
    context: {
      projectId,
      queryClient,
      metadataQueryOptions,
      notesQueryOptions,
      mediaQueryOptions,
    },
    params,
  }) => {
    let newProjectConfig = getProjectConfig(params.mediaId)

    if (projectId) {
      queryClient.prefetchQuery(notesQueryOptions)
      await queryClient.ensureQueryData(metadataQueryOptions)
      await queryClient.prefetchQuery(mediaQueryOptions)
    } else if (shouldForwardMedia) {
      await queryClient.prefetchQuery({
        queryKey: ["media", mediaToForward.src],
        queryFn: () => fetchMediaByUrl(mediaToForward.src),
      })
      newProjectConfig = { ...newProjectConfig, ...mediaToForward }
      invalidateForward()
    }

    return {
      projectId,
      newProjectConfig,
    }
  },
  pendingComponent: () => Loading,
  notFoundComponent: () => <>404: Oops! This media component does not exist.</>,
  errorComponent: () => <>{"Couldn't load media"}</>,
  component: Media,
})

function Media() {
  const match = useMatch({ strict: false })
  const { newProjectConfig } = useLoaderData({})
  const { setMediaRef, setActiveProject } = useProjectContext()
  const { metadataQueryOptions, notesQueryOptions } = useRouteContext({})
  const { data: fetchedMetadata, error: errorFetchingMetadata } =
    useQuery(metadataQueryOptions)
  const { data: fetchedNotes, error: errorFetchingNotes } =
    useQuery(notesQueryOptions)
  const { setContent } = useContent()

  if (errorFetchingMetadata) {
    console.error(`Error fetching metadata: ${errorFetchingMetadata}`)
    throw Error()
  }

  const metadata = useMemo(
    () =>
      fetchedMetadata
        ? { ...newProjectConfig, ...fetchedMetadata }
        : newProjectConfig,
    [fetchedMetadata, newProjectConfig]
  )

  useEffect(() => {
    setActiveProject(metadata)
    return () => setActiveProject(null)
  }, [setActiveProject, metadata])

  if (errorFetchingNotes) {
    console.error(`Error fetching notes: ${errorFetchingNotes}`)
    toast.error("Failed to fetch notes for this project")
    throw Error()
  }
  fetchedNotes && setContent(editorRef.current, fetchedNotes)

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
