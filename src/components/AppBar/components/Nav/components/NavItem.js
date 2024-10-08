import React from 'react'

const NavItem = (props) => {
  const { type, onClick, onShowToolbar, children } = props

  return (
    <button className="text-sm bg-transparent text-black cursor-pointer hover:underline "
      onClick={() => { 
        onClick(children, type) 
        // onShowToolbar();
      }}
    >
      { children }
    </button>
  )
}

export default NavItem
