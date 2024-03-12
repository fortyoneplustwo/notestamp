import React from 'react'
import CloseButton from './CloseButton'

const Modal = React.forwardRef(({ showCloseBtn=true, children }, ref) => {
  return (
    <dialog ref={ref}>
      {showCloseBtn &&
        <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.5em' }}>
          <CloseButton handler={() => {ref.current.close()}}/>
        </div>
      }
      {children}
    </dialog>
  )
})

export default Modal
