import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ModalLayout from "../ModalLayout"
import { Button } from "@/components/ui/button"

const UnsavedChangesModal = ({ onSave, onDiscard, onClose }) => {

  return (
    <ModalLayout onClose={onClose} >
      <DialogHeader>
        <DialogTitle>
          Save changes
        </DialogTitle>
        <DialogDescription>
          Save changes made to this project?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" onClick={onDiscard}>No</Button>
        <Button onClick={onSave}>Yes</Button>
      </DialogFooter>
    </ModalLayout>
  )
}

export default UnsavedChangesModal
