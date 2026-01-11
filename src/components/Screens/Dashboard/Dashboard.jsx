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
} from "@tanstack/react-router"
import { fetchProjects } from "@/lib/fetch/api-read"
import { useMutationState, useQuery } from "@tanstack/react-query"

export const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  component: Dashboard,
  path: "/dashboard/$",
  beforeLoad: ({ params, context }) => {
    if (params._splat) {
      throw notFound()
    }
    const { cwd } = useAppContext.getState()
    if (!context.user && !cwd) throw redirect({ to: "/" })
    return {
      projectsQueryOptions: {
        queryKey: ["projects"],
        queryFn: fetchProjects,
      },
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(context.projectsQueryOptions)
  },
})

function Dashboard() {
  const [inputValue, setInputValue] = useState("")
  const { dirHandle, getDirHandle } = useGetDirHandle()
  const { user, syncToFileSystem, cwd, setCwd } = useAppContext()
  const tableRef = useRef(null)
  const { queryClient, projectsQueryOptions } = useRouteContext({})
  const navigate = useNavigate()

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

  const {
    data: { projects },
    error,
  } = useQuery(projectsQueryOptions)
  if (error) {
    toast.error("Failed to fetch list of projects")
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
  ] = useMemo(
    () =>
      [
        unfulfilledAddMutations,
        unfulfilledUpdateMutations,
        pendingDeleteMutations,
        failedDeleteMutations,
      ].map(arr => dedupByLatestSubmission(arr)),
    [
      unfulfilledAddMutations,
      unfulfilledUpdateMutations,
      failedDeleteMutations,
      pendingDeleteMutations,
    ]
  )

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

      const mostRecentMutation = Array.from(mutations).reduce(
        (acc, [key, val]) => {
          if (acc?.val && val && val.submittedAt > acc.val.submittedAt) {
            return { key, val }
          }
          if (!acc?.val) return { key, val } // if acc undefined, return curr (which may be undefined)
          return acc // acc not undefined
        },
        undefined
      )

      if (
        !mostRecentMutation?.val ||
        mostRecentMutation.val.submittedAt < Date.parse(upstream.lastModified)
      ) {
        if (mostRecentMutation?.key === "pendingDelete") return false // not sure about this
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

    // push adds that were never fulfilled
    // i.e. not part of projects pulled from server
    const unfulfilledAdds = []
    for (const key in dedupedUnfulfilledAddMutations) {
      if (!projects.some(p => p.title === key)) {
        unfulfilledAdds.push(dedupedUnfulfilledAddMutations[key])
      }
    }

    // merge to create staged projects
    return [
      ...optimisticProjects,
      ...unfulfilledSaves,
      ...unfulfilledAdds,
      ...failedDeletes,
    ]
  }, [
    dedupedUnfulfilledAddMutations,
    dedupedUnfulfilledUpdateMutations,
    dedupedPendingDeleteMutations,
    dedupedFailedDeleteMutations,
    projects,
  ])

  const handleOpenProject = title => {
    const selected = stagedProjects.find(p => p.title === title)
    navigate({ from: "/", to: `${selected.type}/${encodeURI(selected.title)}` })
  }

  return (
    <div data-tour-id="dashboard" className="h-full">
      <Toolbar className="flex flex-row gap-3">
        <span className="font-bold max-w-sm truncate overflow-hidden whitespace-nowrap">
          {syncToFileSystem && cwd ? `${cwd.name}` : "Library"}
        </span>
        <div className="flex gap-3 ml-auto">
          {projects && projects?.length > 0 && (
            <Input
              placeholder="Search projects..."
              value={inputValue}
              onChange={event => {
                setInputValue(() => event.target.value)
                tableRef.current?.filterProjects("title", event.target.value)
              }}
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
      <div className="h-full overflow-scroll">
        {cwd && projects && (
          <DataTable
            columns={columns}
            data={stagedProjects}
            ref={tableRef}
            onRowClick={handleOpenProject}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
