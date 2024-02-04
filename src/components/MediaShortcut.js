import React from 'react'
import '../Button.css'

const MediaShortcut = (props) => {
  const { type, path, onClick, children } = props

  return (
    <button  className='nav-btn'
      onClick={() => { onClick(children, type, path) }}
    >
      { children }
    </button>
  )
}

export default MediaShortcut
