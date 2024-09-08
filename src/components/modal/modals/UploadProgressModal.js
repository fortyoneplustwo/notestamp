import ModalLayout from "../ModalLayout"

const UploadProgressModal = () => {
  <ModalLayout showCloseBtn={false} >
    <p>Uploading project</p>
    <progress />
  </ModalLayout>
}

export default UploadProgressModal
