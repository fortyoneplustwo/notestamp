import React from 'react'
import ProjectItem from './ProjectItem'
import { WithToolbar, Toolbar } from './LeftPaneComponents'
import '../Background.css'

const Dashboard = props => {
  const { directory, onOpenProject, onDeleteProject } = props

  return (
    <WithToolbar>
      <Toolbar><span><strong>Library</strong></span></Toolbar>
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1em' }}>
          {directory?.map(item => (
            <ProjectItem 
              key={item.title} 
              title={item.title} 
              onOpen={onOpenProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
        {directory.length === 0 && 
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <p>No saved files to display</p>
          </div>
        }
      </div>
    </WithToolbar>
  )
}

export default Dashboard
