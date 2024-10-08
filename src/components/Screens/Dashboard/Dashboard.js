import React, { useEffect } from 'react'
import DashboardItem from './components/DashboardItem'
import { WithToolbar, Toolbar } from '../../MediaRenderer/components/Toolbar'
import { useGetProjects } from '../../../hooks/useReadData'
import { useDeleteProject } from '../../../hooks/useUpdateData'
import { useCustomFetch } from '../../../hooks/useCustomFetch'

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

  const handleDeleteProject = (projectId) => {
    deleteById(projectId)
    clearCacheByEndpoint("listProjects")
  }

  return (
    <WithToolbar>
      <Toolbar>
        <span className="font-bold">Library</span>
      </Toolbar>
      <div style={{ height: '100%', overflowY: 'auto' }}>
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
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <p>No saved projects to display</p>
          </div>
        )}
      </div>
    </WithToolbar>
  )
}

export default Dashboard
