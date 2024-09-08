import ModalLayout from "../ModalLayout"

const SaveModal = ({ projectToSave = null, onSave, onClose }) => {

  return (
    <ModalLayout onClose={onClose} >
      <form onSubmit={e => {
        e.preventDefault()
        onSave(e)
      }}>
        <p>Save as</p>
        <input style={{ margin: '5px 5px 5px 0' }}
          type='text' 
          name='filename' 
          defaultValue={ projectToSave ? projectToSave.metadata.title : '' }
        />
        <button type='submit'>save</button>
      </form>
    </ModalLayout>
  )
}

export default SaveModal
