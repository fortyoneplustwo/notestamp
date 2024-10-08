import { forwardRef } from "react"
import AppToolbarButton from "../../Button/AppToolbarButton"
import ModalLayout from "../ModalLayout"

const DeleteModal = forwardRef(({ onDelete, onClose }, ref) => {
  return (
    <ModalLayout ref={ref} onClose={onClose} >
      <div>
        <p>Delete this project?</p>
        <div className="flex justify-center mt-4 gap-2">
          <AppToolbarButton
            onClick={onDelete}
            label={"Delete"}
          />
          <AppToolbarButton
            onClick={onClose}
            label={"Cancel"}
          />
        </div>
      </div>
    </ModalLayout>
  )
})

export default DeleteModal
