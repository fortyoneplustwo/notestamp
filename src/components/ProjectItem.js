import React from 'react'
import { Icon } from './Toolbar'

const ProjectItem = props => {
  const { title, onOpen, onDelete } = props

  return (
    <div onClick={() => { onOpen(title) }} 
      style={{ background: 'lightgray', padding: '0.5em' }}
    >
      {title}
      <button title='delete' 
        style={{ background: 'transparent', border: '0', float: 'right', padding: '0' }} 
        onClick={(e) => { 
          e.stopPropagation()
          onDelete(title)
        }}>
        <Icon>delete</Icon>
      </button>
    </div>
  )
}

export default ProjectItem
