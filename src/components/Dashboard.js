import React from 'react'
import ProjectItem from './ProjectItem'

const Dashboard = props => {
  const { directory, onOpenProject, onDeleteProject } = props

  return (
    <div style={{ height: '100', padding: '10px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', padding: '10px' }}>
        {directory?.map(item => (
          <ProjectItem 
            key={item.title} 
            title={item.title} 
            onOpen={onOpenProject}
            onDelete={onDeleteProject}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
