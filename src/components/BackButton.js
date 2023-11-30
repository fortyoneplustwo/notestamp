import React from 'react'
import { Icon } from './Toolbar'

const BackButton = ({ handler }) => {

  const backButtonCSS = {
    color: 'white',
    border: '0',
    cursor: 'pointer',
    background: 'transparent',
    padding: '0'
  }

  return (
    <button style={backButtonCSS} onClick={handler}>
      <Icon>arrow_back</Icon>
    </button>
  )
}

export default BackButton
