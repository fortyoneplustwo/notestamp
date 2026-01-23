import React, { useEffect, useMemo } from "react"
import { defaultMediaConfig } from "@/config"
import { editorRef, useProjectContext } from "../../context/ProjectContext"
import Loading from "../Screens/Loading/Loading"
import { appLayoutRoute } from "@/App"
import {
  createRoute,
  HeadContent,
  Outlet,
  useLoaderData,
  useNavigate,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router"
import { getProjectConfig } from "@/utils/getProjectConfig"
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
import { zodValidator } from "@tanstack/zod-adapter"
import { fallback } from "@tanstack/zod-adapter"
import z from "zod"
import { stripSearchParams } from "@tanstack/react-router"

const mediaModules = import.meta.glob(`./media/*/index.jsx`, {
  import: "default",
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
  validateSearch: zodValidator(
    z.object({
      src: fallback(z.string(), "").default(""),
      mimetype: fallback(z.string(), "").default(""),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ src: "", mimetype: "" })],
  },
  beforeLoad: async ({
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
          const pages = activeQueryFromDashboard?.state.data?.pages || []
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
  loaderDeps: ({ search: { src, mimetype } }) => {
    if (!src || !mimetype) return undefined
    return { mediaToForward: { src, mimetype } }
  },
  loader: async ({
    context: {
      queryClient,
      metadataQueryOptions,
      notesQueryOptions,
      mediaQueryOptions,
    },
    params: { mediaId, projectId },
    deps: { mediaToForward },
  }) => {
    // Dynamically import media modules to trigger chunk download.
    // These are likely cached during preloading.
    let mediaModule = undefined
    const config = defaultMediaConfig.find(c => c.type === mediaId)
    if (!config) {
      throw new Error(
        `No configuration found for media module with id: ${mediaId}`
      )
    }
    const path = `./media/${config.dir}/index.jsx`
    try {
      mediaModule = await mediaModules[path]()
    } catch (err) {
      console.error("Failed to preload media module:", err)
    }

    const templateMetadata = getProjectConfig(mediaId)
    let provisionalMetadata = undefined

    if (projectId) {
      // await new Promise(reject => {
      //   setTimeout(() => {
      //     reject(new Error("test error"))
      //   }, 3 * 1000)
      // }) // Wait 3 secs (for testing only)

      await Promise.all([
        queryClient.ensureQueryData(notesQueryOptions),
        queryClient.ensureQueryData(metadataQueryOptions),
        queryClient.prefetchQuery(mediaQueryOptions),
      ])
      provisionalMetadata = templateMetadata
    } else if (mediaToForward) {
      await queryClient.ensureQueryData({
        queryKey: ["media", mediaToForward.src],
        queryFn: () => fetchMediaByUrl(mediaToForward.src),
      })
      provisionalMetadata = { ...templateMetadata, ...mediaToForward }
    } else {
      provisionalMetadata = templateMetadata
    }

    return {
      mediaId,
      provisionalMetadata,
      Comp: mediaModule,
    }
  },
  pendingMs: 500,
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
  head: ({ params: { mediaId, projectId } }) => ({
    meta: [
      {
        title: projectId
          ? `${projectId} | Notestamp`
          : `${defaultMediaConfig.find(({ type }) => type === mediaId)?.label} | Notestamp`,
      },
    ],
  }),
  component: Media,
})

function Media() {
  const { provisionalMetadata, Comp, mediaId } = useLoaderData({})
  const { setMediaRef, setActiveProject } = useProjectContext()
  const { metadataQueryOptions, notesQueryOptions } = useRouteContext({})
  const { setContent } = useContent()

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

  useEffect(() => {
    if (fetchedNotes) setContent(editorRef.current, fetchedNotes)
  }, [fetchedNotes, setContent])

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

  if (!Comp) {
    throw new Error(`Media module component with id '${mediaId}' is undefined`)
  }

  return (
    <>
      <HeadContent />
      <Comp
        ref={node => {
          setMediaRef(node)
          return () => {
            setMediaRef(null)
          }
        }}
        {...metadata}
      />
    </>
  )
}
