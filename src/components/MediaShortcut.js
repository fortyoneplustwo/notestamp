import React from 'react'
import '../Button.css'

const MediaShortcut = (props) => {
  const { type, path, onClick, children } = props

  return (
    <button onClick={() => { onClick(children, type, path) }} className='nav-btn'>
      { children }
    </button>
  )
}

export default MediaShortcut
