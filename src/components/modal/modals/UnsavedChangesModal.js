import ModalLayout from "../ModalLayout"

const UnsavedChangesModal = ({ onSaveChanges, onDiscardChanges, onClose }) => {

  return (
    <ModalLayout onClose={onClose} >
      <p>Save changes made to this file?</p>
      <br></br>
      <span style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '5px'}}>
        <button onClick={onSaveChanges}> Yes </button>
        <button onClick={onDiscardChanges}> No </button>
      </span>
    </ModalLayout>
  )
}

export default UnsavedChangesModal
