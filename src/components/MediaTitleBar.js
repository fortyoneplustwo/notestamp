import React from 'react'
import { Icon } from './Toolbar'

const MediaTitleBar = ({ label, title, onClose, onSave, user }) => {
  return (
    <div style={{ display: 'flex', flexGrow: '1' }}>
      <button className='nav-btn' 
        onClick={onClose}
        style={{ padding: '2px 10px',
          marginRight: '0',
          textDecoration: 'none', 
          fontWeight: 'bold',
          background: 'purple'
        }}>
        <Icon style={{ fontSize: 'medium', marginRight: '5px', color: 'orangered' }}>
          close
        </Icon>
        { title ? title : label }
      </button>
      { user && <div style={{ display: 'flex', padding: '2px 10px' }}>
          <button className='nav-btn'
            style={{ fontWeight: 'normal' }}
            onClick={onSave}
          >
          <Icon style={{ fontSize: 'medium', marginRight: '5px' }}>save</Icon>
            Save
          </button>
        </div>
      }
    </div>
  )
}

export default MediaTitleBar
