import React from 'react'
import { Icon } from '../../Editor/components/Toolbar'

const CloseButton = ({ handler }) => {

  const closeButtonCSS = {
    color: 'red',
    border: '0',
    cursor: 'pointer',
    background: 'transparent',
    padding: '0'
  }

  return (
    <button style={closeButtonCSS} onClick={handler}>
      <Icon>close</Icon>
    </button>
  )
}

export default CloseButton
