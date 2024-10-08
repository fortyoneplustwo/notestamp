import { forwardRef } from "react"
import ModalLayout from "../ModalLayout"

const NotesUploaderModal = forwardRef(({ onFileSelect, onClose }, ref) => {

  return (
    <ModalLayout onClose={onClose} ref={ref} >
      <form onChange={e => { onFileSelect(e.target.files[0]) }}>
        <input type='file' accept='.stmp' />
      </form>
    </ModalLayout>
  )
})

export default NotesUploaderModal
