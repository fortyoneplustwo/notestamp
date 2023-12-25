import React from 'react'
import CloseButton from './CloseButton'

const Modal = React.forwardRef((props, ref) => {
  const { children } = props
  return (
    <dialog ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.5em' }}>
        <CloseButton handler={() => {ref.current.close()}}/>
      </div>
      {children}
    </dialog>
  )
})

export default Modal
