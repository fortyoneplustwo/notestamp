import React, { useEffect } from 'react'
import DashboardItem from './components/DashboardItem'
import { WithToolbar, Toolbar } from '../../MediaRenderer/components/Toolbar'
import { useGetProjects } from '../../../hooks/useReadData'
import { useDeleteProject } from '../../../hooks/useUpdateData'
import { useCustomFetch } from '../../../hooks/useCustomFetch'
import { MediaToolbarButton } from '../../Button/Button'
import { useGetDirHandle } from '../../../hooks/useFileSystem'
import { useAppContext } from '../../../context/AppContext'
import { FolderOpen } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const { user, syncToFileSystem, cwd, setCwd } = useAppContext()

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
          <MediaToolbarButton
            size="xs"
            className="ml-auto"
            title="Open directory"
            onClick={getDirHandle}
          >
            <FolderOpen />
          </MediaToolbarButton>
        )}
      </Toolbar>
      <div className="h-full overflow-y-scroll"> 
        {projects ? (
          <ScrollArea>
            <ul>
             {projects.sort().map(title => ( // TODO: should sort by date modified
                <DashboardItem 
                  key={title} 
                  id={title} 
                  onOpen={onOpenProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </ul>
          </ScrollArea>
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
