import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ModalLayout from "../ModalLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SaveModal = ({ metadata = null, onSave, onClose }) => {
  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Save project</DialogTitle>
        <DialogDescription>Pick a title for your project</DialogDescription>
      </DialogHeader>
      <form
        id="saveForm"
        onSubmit={e => {
          e.preventDefault()
          onSave(metadata?.title || e.target.filename.value)
        }}
      >
        {!metadata?.title && (
          <Input
            type="text"
            name="filename"
            defaultValue={metadata ? metadata.title : ""}
            autoFocus
            required
          />
        )}
      </form>
      <DialogFooter>
        <Button form="saveForm" type="submit" className="float-right">
          Save
        </Button>
      </DialogFooter>
    </ModalLayout>
  )
}

export default SaveModal
