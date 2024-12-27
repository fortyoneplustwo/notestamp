import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ModalLayout from "../ModalLayout"
import { DefaultButton } from "@/components/Button/Button"

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
        <DefaultButton onClick={onDiscard}>No</DefaultButton>
        <DefaultButton variant="default" onClick={onSave}>Yes</DefaultButton>
      </DialogFooter>
    </ModalLayout>
  )
}

export default UnsavedChangesModal
