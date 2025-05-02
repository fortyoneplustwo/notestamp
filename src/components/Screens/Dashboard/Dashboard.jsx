import React, { useEffect, useRef, useState } from 'react'
import { columns } from "./components/Columns"
import { Toolbar } from '../../MediaRenderer/components/Toolbar'
import { useGetProjects } from '../../../hooks/useReadData'
import { Button } from '@/components/ui/button'
import { useGetDirHandle } from '../../../hooks/useFileSystem'
import { useAppContext } from '../../../context/AppContext'
import { FolderOpen } from 'lucide-react'
import { DataTable } from './components/DataTable'
import { Input } from '@/components/ui/input'

const Dashboard = ({ onOpenProject }) => {
  const [inputValue, setInputValue] = useState("")
  const {
    data: projects,
    fetchAll: fetchAllProjects,
    loading: loadingProjects,
    error: errorFetchingProjects
  } = useGetProjects()
  const { dirHandle, getDirHandle } = useGetDirHandle()
  const { user, syncToFileSystem, cwd, setCwd } = useAppContext()
  const tableRef = useRef(null)

  useEffect(() => {
    if (user || cwd) {
      fetchAllProjects()
    }
  }, [fetchAllProjects])

  useEffect(() => {
    if (!loadingProjects) {
      if (errorFetchingProjects) {
        // handle error
      }
      console.log(projects)
    }
  }, [errorFetchingProjects, loadingProjects])

  useEffect(() => {
    if (dirHandle) {
      setCwd(dirHandle)
    }
  }, [dirHandle, setCwd])

  const handleRowClicked = (title) =>
    onOpenProject(projects.find(p => p.title === title))

  return (
    <div data-tour-id="dashboard" className="h-full">
      <Toolbar className="flex flex-row gap-3">
        <span className="font-bold max-w-sm truncate overflow-hidden whitespace-nowrap">
          {(syncToFileSystem && cwd) ? `${cwd.name}` : "Library"}
        </span>
        <div className="flex gap-3 ml-auto">
          {projects && projects?.length > 0 && (
            <Input
              placeholder="Search projects..."
              value={inputValue}
              onChange={(event) => {
                setInputValue(() => event.target.value)
                tableRef.current?.filterProjects("title", event.target.value)
              }}
              className="max-w-xs min-w-[150px] h-6"
            />
          )}
          {syncToFileSystem && (
            <Button
              size="xs"
              title="Change directory"
              className="open-dir-btn"
              onClick={getDirHandle}
            >
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
            onRowClick={handleRowClicked}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
