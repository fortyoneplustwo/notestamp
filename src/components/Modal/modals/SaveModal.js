import { forwardRef } from "react"
import AppToolbarButton from "../../Button/AppToolbarButton"
import ModalLayout from "../ModalLayout"

const SaveModal = forwardRef(({ projectToSave = null, onSave, onClose }, ref) => {

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
          defaultValue={ projectToSave ? projectToSave.metadata.title : '' }
          className="border border-black mt-1"
        />
        <div className="pt-3">
          <AppToolbarButton
            label={"Save"}
            type="submit"
            style={{ float: "right" }}
          />
        </div>
      </form>
    </ModalLayout>
  )
})

export default SaveModal
