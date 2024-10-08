import React, { useState } from 'react'
import NavItem from './components/NavItem'

const Nav = ({ items, onClick }) => {
  const [showMediaShortcuts, setShowMediaShortcuts] = useState(true);

  return (
    <nav className="flex items-center">
      <ul className="flex gap-4">
        {items.map((item, index) => {
          return <NavItem
            key={index} 
            onShowToolbar={() => { setShowMediaShortcuts(false)} }
            onClick={onClick} 
            {...item} 
          >
            { item.label }
          </NavItem>
        })}
      </ul>
    </nav>
  ) 
}

export default Nav
