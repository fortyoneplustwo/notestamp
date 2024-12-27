import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DefaultButton } from "../../Button/Button"
import ModalLayout from "../ModalLayout"

const DeleteModal = ({ onDelete, onClose }) => {
  return (
    <ModalLayout onClose={onClose} >
      <DialogHeader>
        <DialogTitle>
          Delete project
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this project?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div>
          <div className="flex justify-center mt-4 gap-2">
            <DefaultButton
              onClick={onClose}
            >
              Cancel
            </DefaultButton>
            <DefaultButton
              variant="default"
              onClick={onDelete}
            >
              Delete
            </DefaultButton>
          </div>
        </div>
      </DialogFooter>
    </ModalLayout>
  )
}

export default DeleteModal
