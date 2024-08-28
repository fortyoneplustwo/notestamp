import React from 'react'
import CloseButton from './CloseButton'

const Modal = React.forwardRef(({ showCloseBtn=true, children }, ref) => {
  return (
    <dialog ref={ref} className="border border-black">
      {showCloseBtn &&
        <div
          className="flex justify-end"
        >
          <CloseButton handler={() => {ref.current.close()}}/>
        </div>
      }
      <div className="flex p-2 text-sm">
        {children}
      </div>
    </dialog>
  )
})

export default Modal
