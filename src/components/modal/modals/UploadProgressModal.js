import ModalLayout from "../ModalLayout"

const UploadProgressModal = () => {
  return (
    <ModalLayout showCloseBtn={false} >
      <p>Uploading project</p>
      <progress />
    </ModalLayout>
  )
}

export default UploadProgressModal
