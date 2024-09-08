
import React from 'react'
import CloseButton from '../CloseButton'

const ModalLayout = ({ showCloseBtn=true, onClose, children }) => {
  return (
    <dialog open className="border border-black self-center">
      {showCloseBtn && (
        <div className="flex justify-end" >
          <CloseButton handler={onClose}/>
        </div>
      )}
      <div className="flex p-2 text-sm">
        { children }
      </div>
    </dialog>
  )
}

export default ModalLayout
