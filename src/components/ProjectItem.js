import React from 'react'
import { Icon } from './Toolbar'

const ProjectItem = props => {
  const { title, onOpen, onDelete } = props

  return (
    <div onClick={() => { onOpen(title) }} style={{ background: '#1D2021', padding: '0.5em', borderRadius: '7px' }}>
      {title}
      <button title='delete' style={{ background: 'transparent', border: '0', float: 'right', padding: '0' }} onClick={(e) => { 
        e.stopPropagation()
        onDelete(title)
      }}>
        <Icon>delete</Icon>
      </button>
    </div>
  )
}

export default ProjectItem
