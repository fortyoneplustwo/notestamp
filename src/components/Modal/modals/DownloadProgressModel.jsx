import ModalLayout from "../ModalLayout"

const DownloadProgressModal = () => {
  <ModalLayout showCloseBtn={false} >
    <p>Fetching project</p>
    <progress />
  </ModalLayout>
}

export default DownloadProgressModal
