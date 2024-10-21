import { forwardRef } from "react"
import Button from "../../Button/Button"
import ModalLayout from "../ModalLayout"

const DeleteModal = forwardRef(({ onDelete, onClose }, ref) => {
  return (
    <ModalLayout ref={ref} onClose={onClose} >
      <div>
        <p>Delete this project?</p>
        <div className="flex justify-center mt-4 gap-2">
          <Button
            onClick={onDelete}
          >
            Delete
          </Button>
          <Button
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
})

export default DeleteModal
