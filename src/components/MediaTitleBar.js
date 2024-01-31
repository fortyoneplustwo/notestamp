import React from 'react'
import { Icon } from './Toolbar'

const MediaTitleBar = ({ title, onClose }) => {
  return (
    <div style={{ display: 'flex', flexGrow: '1' }}>
      <button className='nav-btn' 
        onClick={onClose}
        style={{ padding: '2px 10px 2px 10px',
          textDecoration: 'none', 
          background: 'purple'
        }}>
        <Icon style={{ fontSize: 'medium', marginRight: '5px', color: 'red' }}>
          close
        </Icon>
        { title }
      </button>
    </div>
  )
}

export default MediaTitleBar
