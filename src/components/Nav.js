import React from 'react'
import MediaShortcut from './MediaShortcut'

const Nav = ({ items, onClick }) => {
  return (
    <nav style={{ padding: '2px 10px 2px 10px' }}>
      <ul style={{ margin: '0', padding: '0', justifySelf: 'center' }}>
        {items.map((item, index) => {
          return <MediaShortcut key={index} onClick={onClick} {...item} >
            { item.label }
          </MediaShortcut>
        })}
      </ul>
    </nav>
  ) 
}

export default Nav
