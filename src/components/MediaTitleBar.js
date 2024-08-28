import React from 'react'
import { Icon } from './Toolbar'

const MediaTitleBar = ({ label, title, onClose, onSave, user }) => {
  return (
    <div className="flex">
      <button className="flex bg-transparent text-black border border-[#D3D3D3] hover:bg-[#D3D3D3] rounded cursor-pointer text-sm" 
        onClick={onClose}
      >
        <span
          className="flex-grow h-full flex items-center justify-center px-1"
        >
          { /*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
            stroke="red" 
            className="h-full w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          */ }
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="orangered" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="h-full w-4 mr-0.5"
          >
            <path d="M3 3h18v18H3zM15 9l-6 6m0-6l6 6"/>
          </svg>
          { title ? title : label }
        </span>
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
