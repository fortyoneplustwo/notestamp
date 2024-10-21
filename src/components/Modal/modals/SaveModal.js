import { forwardRef } from "react"
import Button from "../../Button/Button"
import ModalLayout from "../ModalLayout"

const SaveModal = forwardRef(({ metadata=null, onSave, onClose }, ref) => {

  return (
    <ModalLayout ref={ref} onClose={onClose} >
      <form onSubmit={e => {
        e.preventDefault()
        onSave(e.target.filename.value)
      }}>
        <p>Project title:</p>
        <input
          type='text' 
          name='filename' 
          defaultValue={ metadata ? metadata.title : '' }
          className="border border-black mt-1"
          autofocus
        />
        <div className="pt-3">
          <Button
            type="submit"
            style={{ float: "right" }}
          >
            Save 
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
})

export default SaveModal
