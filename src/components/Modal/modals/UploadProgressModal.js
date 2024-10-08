import { forwardRef } from "react"
import ModalLayout from "../ModalLayout"

const UploadProgressModal = forwardRef((_, ref) => {
  return (
    <ModalLayout ref={ref} showCloseBtn={false} >
      <div>
        <p>Uploading project</p>
        <progress className="mt-3" />
      </div>
    </ModalLayout>
  )
})

export default UploadProgressModal
