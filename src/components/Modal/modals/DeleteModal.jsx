import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ModalLayout from "../ModalLayout"
import { Button } from "@/components/ui/button"

const DeleteModal = ({ onDelete, onClose }) => {
  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Delete project</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this project?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div>
          <div className="flex justify-center mt-4 gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </DialogFooter>
    </ModalLayout>
  )
}

export default DeleteModal
