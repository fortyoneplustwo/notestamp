import React from 'react'
import '../Button.css'

const MediaShortcut = (props) => {
  const { type, onClick, children } = props

  return (
    <button  className='nav-btn'
      onClick={() => { onClick(children, type) }}
    >
      { children }
    </button>
  )
}

export default MediaShortcut
