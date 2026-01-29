import React, { useEffect, useMemo, useRef, useState } from "react"
import { columns } from "./components/Columns"
import { Toolbar } from "../../MediaRenderer/components/Toolbar"
import { Button } from "@/components/ui/button"
import { useGetDirHandle } from "../../../hooks/useFileSystem"
import { useAppContext } from "../../../context/AppContext"
import { FolderOpen } from "lucide-react"
import { DataTable } from "./components/DataTable"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { appLayoutRoute } from "@/App"
import {
  createRoute,
  useNavigate,
  useRouteContext,
  redirect,
  notFound,
  HeadContent,
  useSearch,
  stripSearchParams,
} from "@tanstack/react-router"
import { fetchProjects } from "@/lib/fetch/api-read"
import {
  useInfiniteQuery,
  useMutationState,
  keepPreviousData,
} from "@tanstack/react-query"
import Loading from "../Loading/Loading"
import { useDebounce } from "@uidotdev/usehooks"
import { Pagination } from "./components/Pagination"
import { zodValidator } from "@tanstack/zod-adapter"
import z from "zod"
import { fallback } from "@tanstack/zod-adapter"

export const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard/$",
  validateSearch: zodValidator(
    z.object({
      query: fallback(z.string(), "").default(""),
      filter: fallback(z.string(), "").default(""),
      sort: fallback(z.enum(["desc", "asc"]), "desc").default("desc"),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ query: "", filter: "", sort: "desc" })],
  },
  beforeLoad: ({ params, context }) => {
    if (params._splat) {
      throw notFound()
    }
    const { cwd } = useAppContext.getState()
    if (!context.user && !cwd) throw redirect({ to: "/" })
    return {
      projectsQueryOptions: {
        initialPageParam: 0,
        placeholderData: keepPreviousData,
        getNextPageParam: lastPage => lastPage?.nextOffset,
        staleTime: Infinity,
      },
    }
  },
  loaderDeps: ({ search: { query, filter, sort } }) => ({
    searchParam: query,
    columnFilters: [{ id: "type", value: filter || null }],
    sorting: [{ id: "lastModified", desc: sort === "desc" }],
  }),
  loader: async ({ context: { queryClient }, deps }) => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ["projects", deps],
      queryFn: ({ pageParam }) =>
        fetchProjects({
          pageParam,
          ...deps,
        }),
      initialPageParam: 0,
      getNextPageParam: () => 5,
      staleTime: Infinity,
    })
  },
  head: () => ({
    meta: [
      {
        title: "Dashboard | Notestamp",
      },
    ],
  }),
  component: Dashboard,
})

function Dashboard() {
  const [inputValue, setInputValue] = useState("")
  const debouncedInput = useDebounce(inputValue, 300)

  const [columnFilters, setColumnFilters] = useState([
    { id: "type", value: null },
  ])
  const [sorting, setSorting] = useState([{ id: "lastModified", desc: true }])

  const { dirHandle, getDirHandle } = useGetDirHandle()
  const { user, syncToFileSystem, cwd, setCwd } = useAppContext()
  const { queryClient, projectsQueryOptions } = useRouteContext({})
  const navigate = useNavigate()

  const tableRef = useRef(null)
  const paginationRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const { query } = useSearch({})

  const {
    data,
    error,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...projectsQueryOptions,
    queryFn: ({ pageParam }) =>
      fetchProjects({
        pageParam,
        searchParam: query,
        columnFilters,
        sorting,
      }),
    queryKey: ["projects", { searchParam: query, columnFilters, sorting }],
  })

  useEffect(() => {
    if (dirHandle) {
      setCwd(dirHandle)
    }
  }, [dirHandle, setCwd])

  useEffect(() => {
    if (user || cwd) {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    }
  }, [user, cwd, queryClient])

  useEffect(() => {
    navigate({
      from: dashboardRoute.fullPath,
      search: prev => ({ ...prev, query: debouncedInput ?? "" }),
    })
  }, [debouncedInput, navigate])

  // Fetch next page when table is scrolled to the very bottom.
  useEffect(() => {
    const target = paginationRef.current
    const root = scrollContainerRef.current

    if (!target || !root) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }
      },
      { root: root, threshold: 1.0 }
    )
    observer.observe(target)

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, data])

  useEffect(() => {
    if (error) {
      console.error(error)
      toast.error("Failed to fetch list of projects")
    }
  }, [error])

  const handleColumnFiltersChange = updater => {
    const newColumnFiltersVal =
      updater instanceof Function ? updater(columnFilters) : updater
    navigate({
      from: dashboardRoute.fullPath,
      search: prev => {
        console.log({ prev })
        return { ...prev, filter: newColumnFiltersVal[0]?.value }
      },
    })
    setColumnFilters(newColumnFiltersVal)
  }

  const handleSortingChange = updater => {
    const newSortingVal =
      updater instanceof Function ? updater(sorting) : updater
    navigate({
      from: dashboardRoute.fullPath,
      search: prev => ({
        ...prev,
        sort: newSortingVal[0]?.desc ? "desc" : "asc",
      }),
    })
    setSorting(newSortingVal)
  }

  const unfulfilledAddMutations = useMutationState({
    filters: {
      mutationKey: ["addProject"],
      predicate: mut =>
        mut.state.status === "pending" || mut.state.status === "error",
    },
    select: mut => {
      return {
        ...mut.state.variables.metadata,
        status: mut.state.status,
        submittedAt: mut.state.submittedAt,
        lastModified: new Date(mut.state.submittedAt).toISOString(),
      }
    },
  })

  const unfulfilledUpdateMutations = useMutationState({
    filters: {
      mutationKey: ["updateProject"],
      predicate: mut =>
        mut.state.status === "pending" || mut.state.status === "error",
    },
    select: mut => {
      return {
        ...mut.state.variables.metadata,
        status: mut.state.status,
        submittedAt: mut.state.submittedAt,
        lastModified: new Date(mut.state.submittedAt).toISOString(),
      }
    },
  })

  const pendingDeleteMutations = useMutationState({
    filters: {
      mutationKey: ["deleteProject"],
      predicate: mut => mut.state.status === "pending",
    },
    select: mut => {
      return {
        ...mut.state.context,
        status: mut.state.status,
        submittedAt: mut.state.submittedAt,
      }
    },
  })

  const failedDeleteMutations = useMutationState({
    filters: {
      mutationKey: ["deleteProject"],
      predicate: mut => mut.state.status === "error",
    },
    select: mut => {
      return {
        ...mut.state.context,
        status: mut.state.status,
        submittedAt: mut.state.submittedAt,
        lastModified: new Date(mut.state.submittedAt).toISOString(),
      }
    },
  })

  const successfulDeleteMutations = useMutationState({
    filters: {
      mutationKey: ["deleteProject"],
      predicate: mut => mut.state.status === "success",
    },
    select: mut => {
      return {
        ...mut.state.context,
        status: mut.state.status,
        submittedAt: mut.state.submittedAt,
        lastModified: new Date(mut.state.submittedAt).toISOString(),
      }
    },
  })

  const dedupByLatestSubmission = mutations => {
    if (mutations.length === 0) return {}
    return mutations.reverse().reduce((acc, curr) => {
      const existing = acc[curr.title]
      if (!existing || curr.submittedAt >= existing.submittedAt) {
        acc[curr.title] = curr
      }
      return acc
    }, {})
  }

  const [
    dedupedUnfulfilledAddMutations,
    dedupedUnfulfilledUpdateMutations,
    dedupedPendingDeleteMutations,
    dedupedFailedDeleteMutations,
    dedupedSuccessfulDeleteMutations,
  ] = useMemo(
    () =>
      [
        unfulfilledAddMutations,
        unfulfilledUpdateMutations,
        pendingDeleteMutations,
        failedDeleteMutations,
        successfulDeleteMutations,
      ].map(arr => dedupByLatestSubmission(arr)),
    [
      unfulfilledAddMutations,
      unfulfilledUpdateMutations,
      failedDeleteMutations,
      pendingDeleteMutations,
      successfulDeleteMutations,
    ]
  )

  const projects = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return []
    return data.pages.flatMap(page => {
      return page?.projects
    })
  }, [data])

  const stagedProjects = useMemo(() => {
    const unfulfilledSaves = []
    const failedDeletes = []

    const optimisticProjects = projects.filter(upstream => {
      const mutations = new Map()
      mutations.set(
        "unfulfilledAdd",
        dedupedUnfulfilledAddMutations[upstream.title]
      )
      mutations.set(
        "unfulfilledUpdate",
        dedupedUnfulfilledUpdateMutations[upstream.title]
      )
      mutations.set(
        "pendingDelete",
        dedupedPendingDeleteMutations[upstream.title]
      )
      mutations.set(
        "failedDelete",
        dedupedFailedDeleteMutations[upstream.title]
      )
      mutations.set(
        "successfulDelete",
        dedupedSuccessfulDeleteMutations[upstream.title]
      )

      const mostRecentMutation = Array.from(mutations).reduce(
        (acc, [key, val]) => {
          if (acc?.val && val && val.submittedAt > acc.val.submittedAt) {
            return { key, val }
          }
          if (!acc?.val) return { key, val }
          return acc
        },
        undefined
      )

      if (
        !mostRecentMutation?.val ||
        mostRecentMutation.val.submittedAt < Date.parse(upstream.lastModified)
      ) {
        if (mostRecentMutation?.key === "pendingDelete") {
          return false
        }
        return true
      }
      if (mostRecentMutation?.key === "unfulfilledUpdate") {
        unfulfilledSaves.push(mostRecentMutation.val)
        return false
      }
      if (mostRecentMutation?.key === "failedDelete") {
        failedDeletes.push(mostRecentMutation.val)
        return false
      }
      return false
    })

    const neverFulfilledAdds = []
    for (const key in dedupedUnfulfilledAddMutations) {
      if (!projects.some(p => p.title === key)) {
        neverFulfilledAdds.push(dedupedUnfulfilledAddMutations[key])
      }
    }

    return [
      ...optimisticProjects,
      ...unfulfilledSaves,
      ...neverFulfilledAdds,
      ...failedDeletes,
    ]
  }, [
    dedupedUnfulfilledAddMutations,
    dedupedUnfulfilledUpdateMutations,
    dedupedPendingDeleteMutations,
    dedupedFailedDeleteMutations,
    dedupedSuccessfulDeleteMutations,
    projects,
  ])

  const handleOpenProject = title => {
    const selected = stagedProjects.find(p => p.title === title)
    navigate({ from: "/", to: `${selected.type}/${encodeURI(selected.title)}` })
  }

  return (
    <>
      <HeadContent />
      <div data-tour-id="dashboard" className="flex flex-col h-full">
        <Toolbar className="flex flex-row gap-3">
          <span className="font-bold max-w-sm truncate overflow-hidden whitespace-nowrap">
            {syncToFileSystem && cwd ? `${cwd.name}` : "Library"}
          </span>
          <div className="flex gap-3 ml-auto">
            {stagedProjects && (
              <Input
                placeholder="Search projects..."
                onChange={e => setInputValue(e.target.value)}
                className="max-w-xs min-w-[150px] h-6"
              />
            )}
            {syncToFileSystem && (
              <Button size="xs" title="Change directory" onClick={getDirHandle}>
                <FolderOpen />
              </Button>
            )}
          </div>
        </Toolbar>
        <div className="flex-1 min-h-0 overflow-auto" ref={scrollContainerRef}>
          {status === "pending" && <Loading />}
          {status === "success" && (
            <>
              <DataTable
                columnFilters={columnFilters}
                onColumnFiltersChange={handleColumnFiltersChange}
                sorting={sorting}
                onSortingChange={handleSortingChange}
                scrollContainerRef={scrollContainerRef}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                columns={columns}
                data={stagedProjects}
                ref={tableRef}
                onRowClick={handleOpenProject}
              />
              <Pagination
                ref={paginationRef}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
