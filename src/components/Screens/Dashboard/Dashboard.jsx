import React, { useEffect, useRef, useState } from "react"
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
import { useQuery } from "@tanstack/react-query"

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

  const handleOpenProject = title => {
    const selected = projects.find(project => project.title === title)
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
            data={projects}
            ref={tableRef}
            onRowClick={handleOpenProject}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
