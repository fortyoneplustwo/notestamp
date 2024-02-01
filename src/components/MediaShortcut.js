import React from 'react'
import '../Button.css'

const MediaShortcut = (props) => {
  const { type, src, path, onClick, children } = props

  return (
    <button onClick={() => { onClick(children, type, src, path) }} className='nav-btn'>
      { children }
    </button>
  )
}

export default MediaShortcut
