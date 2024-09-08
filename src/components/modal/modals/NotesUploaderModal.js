import ModalLayout from "../ModalLayout"

const NotesUploaderModal = ({ onFileSelect, onClose }) => {

  return (
    <ModalLayout onClose={onClose} >
      <form onChange={e => { onFileSelect(e.target.files[0]) }}>
        <input type='file' accept='.stmp' />
      </form>
    </ModalLayout>
  )
}

export default NotesUploaderModal
