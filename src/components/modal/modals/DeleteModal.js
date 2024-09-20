import ModalLayout from "../ModalLayout"

const DeleteModal = ({ onDelete, onClose }) => {
  return (
    <ModalLayout onClose={onClose} >
      <p>Delete this project?</p>
      <br></br>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '5px'}}>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </ModalLayout>
  )
}

export default DeleteModal
