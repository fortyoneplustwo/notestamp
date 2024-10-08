import React, { forwardRef } from 'react'
import CloseButton from './components/CloseButton'

const ModalLayout = forwardRef(({ showCloseBtn=true, onClose, children }, ref) => {
  return (
    <dialog ref={ref} className="border border-black self-center rounded">
      {showCloseBtn && (
        <div className="flex justify-end">
          <CloseButton handler={onClose} />
        </div>
      )}
      <div className="flex p-2 text-sm">
        { children }
      </div>
    </dialog>
  )
})

export default ModalLayout
