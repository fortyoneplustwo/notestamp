import React, { useEffect } from 'react'
import DashboardItem from './components/DashboardItem'
import { WithToolbar, Toolbar } from '../../MediaRenderer/components/Toolbar'
import { useGetProjects } from '../../../hooks/useReadData'
import { useDeleteProject } from '../../../hooks/useUpdateData'
import { useCustomFetch } from '../../../hooks/useCustomFetch'
import Button from '../../Button/Button'
import { useGetDirHandle } from '../../../hooks/useFileSystem'
import { useAppContext } from '../../../context/AppContext'

const Dashboard = ({ onOpenProject }) => {
  const { 
    data: projects,
    fetchAll: fetchAllProjects, 
    loading: loadingProjects, 
    error: errorFetchingProjects
  } = useGetProjects()
  const { 
    deleteById,
    loading: loadingDelete,
    error: errorDeleting
  } = useDeleteProject()
  const { clearCacheByEndpoint } = useCustomFetch()
  const { dirHandle, getDirHandle } = useGetDirHandle()
  const { syncToFileSystem, cwd, setCwd } = useAppContext()

  useEffect(() => {
    fetchAllProjects()
  }, [fetchAllProjects])

  useEffect(() => {
    if (!loadingProjects) {
      if (errorFetchingProjects) {
        // handle error
      }
    }
  }, [errorFetchingProjects, loadingProjects])

  useEffect(() => {
    if (!loadingDelete) {
      if (errorDeleting) {
        // handle error
      }
    fetchAllProjects()
    }
  }, [loadingDelete, errorDeleting, fetchAllProjects])

  useEffect(() => {
    if (dirHandle) {
      setCwd(dirHandle)
    }
  }, [dirHandle, setCwd])

  const handleDeleteProject = (projectId) => {
    deleteById(projectId)
    clearCacheByEndpoint("listProjects")
  }

  return (
    <WithToolbar>
      <Toolbar>
        <span className="font-bold">
          { (syncToFileSystem && cwd) ? `${cwd.name}` : "Library" }
        </span>
        {syncToFileSystem && (
          <Button
            onClick={getDirHandle}
            style={{ marginLeft: "auto" }}
          >
            Open directory
          </Button>
        )}
      </Toolbar>
      <div className="h-full overflow-y-auto"> 
        {projects ? (
          <ul>
           {projects.map(item => (
              <DashboardItem 
                key={item} 
                id={item} 
                onOpen={onOpenProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </ul>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No saved projects to display</p>
          </div>
        )}
      </div>
    </WithToolbar>
  )
}

export default Dashboard
