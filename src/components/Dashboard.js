import React from 'react'
import ProjectItem from './ProjectItem'
<<<<<<< HEAD

const Dashboard = props => {
  const { directory, onOpenProject, onDeleteProject } = props
=======
import { getProjectData, deleteProject } from '../api'

const Dashboard = props => {
  const { directory, onProjectSelected, onProjectDeleted } = props

  // Call API to get project data
  const handleProjectOpen = title => {
    getProjectData(title) 
      .then(data => {
        if (data) onProjectSelected(title, data.content)
      })
  }

  const handleProjectDelete = title => {
    deleteProject(title)
      .then(newDirectory => {
        if (newDirectory) onProjectDeleted(newDirectory)
      })
  }
>>>>>>> 76b74cf148c2104cf67f4a6d7053453f4ce4d7d5

  return (
    <div style={{ height: '100%', padding: '10px' }}>
      <label>Projects:</label>
      <br></br>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', overflow: 'scroll', padding: '10px' }}>
        {directory?.map(item => (
          <ProjectItem 
            key={item.title} 
            title={item.title} 
<<<<<<< HEAD
            onOpen={onOpenProject}
            onDelete={onDeleteProject}
=======
            onOpen={handleProjectOpen}
            onDelete={handleProjectDelete}
>>>>>>> 76b74cf148c2104cf67f4a6d7053453f4ce4d7d5
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
