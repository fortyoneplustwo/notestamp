import React, { useState } from 'react'
import MediaShortcut from './MediaShortcut'

const Nav = ({ items, onClick }) => {
  const [showMediaShortcuts, setShowMediaShortcuts] = useState(true);

  return (
    <nav className="flex items-center">
      <ul className="flex gap-4">
        {items.map((item, index) => {
          return <MediaShortcut 
            key={index} 
            onShowToolbar={() => { setShowMediaShortcuts(false)} }
            onClick={onClick} 
            {...item} 
          >
            { item.label }
          </MediaShortcut>
        })}
      </ul>
    </nav>
  ) 
}

export default Nav
