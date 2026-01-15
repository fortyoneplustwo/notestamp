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
  useNavigate,
  useRouteContext,
  useRouter,
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
import { redirect, notFound } from "@tanstack/react-router"
import { Error as ErrorScreen } from "../Screens/Loading/Error"

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
  path: "/$mediaId/{-$projectId}",
  beforeLoad: ({
    context: { queryClient },
    params: { mediaId, projectId },
  }) => {
    try {
      getProjectConfig(mediaId)
    } catch {
      throw notFound()
    }

    const { user, cwd } = useAppContext.getState()
    if (projectId && !user && !cwd) {
      throw redirect({ to: "/" })
    }

    return {
      metadataQueryOptions: {
        queryKey: ["metadata", projectId],
        queryFn: () => fetchMetadata(projectId),
        enabled: !!projectId,
        initialData: () => {
          // If we navigated by clicking on a project in the dashboard,
          // then we can simply grab the metadata from its cache
          const activeQueryFromDashboard = queryClient.getQueryCache().find({
            queryKey: ["projects"],
            exact: false,
            active: true,
          })
          const pages = activeQueryFromDashboard.state.data?.pages
          let cachedMetadata = undefined
          for (const page of pages) {
            cachedMetadata = page.projects?.find(
              project => project.title === projectId
            )
          }
          return cachedMetadata
        },
        // Opening a project puts it in "draft" mode which means:
        //  1. We should fetch the most up-to-date data
        //  2. No background refetches are allowed to overwrite the draft
        staleTime: Infinity,
      },
      notesQueryOptions: {
        queryKey: ["notes", projectId],
        queryFn: async () => {
          return fetchNotes(projectId)
        },
        enabled: !!projectId,
        staleTime: Infinity,
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
      queryClient,
      metadataQueryOptions,
      notesQueryOptions,
      mediaQueryOptions,
    },
    params: { mediaId, projectId },
  }) => {
    const templateMetadata = getProjectConfig(mediaId)
    let provisionalMetadata = undefined
    let unfulfilledMutation = undefined

    if (projectId) {
      // await new Promise(reject => {
      //   setTimeout(() => {
      //     reject(new Error("test error"))
      //   }, 3 * 1000)
      // }) // Wait 3 secs (for testing only)

      await Promise.all([
        queryClient.prefetchQuery(notesQueryOptions),
        queryClient.prefetchQuery(metadataQueryOptions),
        queryClient.prefetchQuery(mediaQueryOptions),
      ])
      provisionalMetadata = templateMetadata
    } else if (shouldForwardMedia) {
      await queryClient.prefetchQuery({
        queryKey: ["media", mediaToForward.src],
        queryFn: () => fetchMediaByUrl(mediaToForward.src),
      })
      provisionalMetadata = { ...templateMetadata, ...mediaToForward }
      invalidateForward()
    } else {
      provisionalMetadata = templateMetadata
    }

    return {
      provisionalMetadata,
      unfulfilledMutation: unfulfilledMutation,
    }
  },
  pendingMs: 10,
  pendingComponent: Loading,
  errorComponent: ({ error }) => {
    const router = useRouter()
    const { user, cwd } = useAppContext()
    const navigate = useNavigate()
    return (
      <ErrorScreen
        errorMsg={error.message}
        onRetry={router.invalidate}
        onExit={() => {
          if (user || cwd) return navigate({ to: "/dashboard" })
          navigate({ to: "/" })
        }}
      />
    )
  },
  component: Media,
})

function Media() {
  const match = useMatch({ strict: false })
  const { provisionalMetadata } = useLoaderData({})
  const { setMediaRef, setActiveProject } = useProjectContext()
  const { setContent } = useContent()
  const { metadataQueryOptions, notesQueryOptions } = useRouteContext({})

  const { data: fetchedMetadata, error: errorFetchingMetadata } =
    useQuery(metadataQueryOptions)
  const { data: fetchedNotes, error: errorFetchingNotes } =
    useQuery(notesQueryOptions)

  useEffect(() => {
    if (errorFetchingMetadata) {
      console.error(`Error fetching metadata: ${errorFetchingMetadata}`)
      throw Error()
    }
  }, [errorFetchingMetadata])

  useEffect(() => {
    if (errorFetchingNotes) {
      console.error(`Error fetching notes: ${errorFetchingNotes}`)
      toast.error("Failed to fetch notes")
      throw Error()
    }
  }, [errorFetchingNotes])

  const metadata = useMemo(
    () =>
      fetchedMetadata
        ? { ...provisionalMetadata, ...fetchedMetadata }
        : { ...provisionalMetadata },
    [fetchedMetadata, provisionalMetadata]
  )

  useEffect(() => {
    if (metadata) {
      setActiveProject(metadata)
    }
    return () => setActiveProject(null)
  }, [setActiveProject, metadata])

  const Comp = mediaComponentsMap.get(match.params.mediaId)
  if (!Comp) {
    return (
      <div className="h-full items-center justify-center">
        <p>Oops! This media component does not exist.</p>
      </div>
    )
  }

  fetchedNotes && setContent(editorRef.current, fetchedNotes)

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
