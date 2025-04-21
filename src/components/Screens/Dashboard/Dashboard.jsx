import React, { useEffect, useRef } from 'react'
import { columns } from "./components/Columns"
import { Toolbar } from '../../MediaRenderer/components/Toolbar'
import { useGetProjects } from '../../../hooks/useReadData'
import { MediaToolbarButton } from '../../Button/Button'
import { useGetDirHandle } from '../../../hooks/useFileSystem'
import { useAppContext } from '../../../context/AppContext'
import { FolderOpen } from 'lucide-react'
import { DataTable } from './components/DataTable'
import { Input } from '@/components/ui/input'
import FileSyncInstructions from '../Welcome/FileSyncInstructions'

const Dashboard = ({ onOpenProject }) => {
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
    }
  }, [errorFetchingProjects, loadingProjects])

  useEffect(() => {
    if (dirHandle) {
      setCwd(dirHandle)
    }
  }, [dirHandle, setCwd])

  return (
    <div data-tour-id="dashboard" className="h-full">
      <Toolbar className="flex flex-row gap-3">
        <span className="font-bold max-w-sm truncate overflow-hidden whitespace-nowrap">
          { (syncToFileSystem && cwd) ? `${cwd.name}` : "Library" }
        </span>
        <div className="flex gap-3 ml-auto">
          {projects && projects?.length > 0 && (
            <Input
              placeholder="Filter projects..."
              value={tableRef.current?.getFilterValue("title")}
              onChange={(event) => 
                tableRef.current?.filterProjects("title", event.target.value)
              }
              className="max-w-xs min-w-[150px] h-6"
            />
          )}
          {syncToFileSystem && (
            <MediaToolbarButton
              className="open-dir-btn"
              size="xs"
              title="Change directory"
              onClick={getDirHandle}
            >
              <FolderOpen />
            </MediaToolbarButton>
          )}
        </div>
      </Toolbar>
      <div className="h-full overflow-auto">
        {cwd && projects && (
          <DataTable 
            columns={columns} 
            data={projects} 
            ref={tableRef} 
            onRowClick={onOpenProject}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
