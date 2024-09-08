import DownloadProgressModal from "./modals/DownloadProgressModel"
import NotesUploaderModal from "./modals/NotesUploaderModal"
import SaveModal from "./modals/SaveModal"
import UnsavedChangesModal from "./modals/UnsavedChangesModal"
import UploadProgressModal from "./modals/UploadProgressModal"

const ModalRenderer = ({ modal, props }) => {
  const modals = {
    notesUploader: NotesUploaderModal,
    projectSaver: SaveModal,
    unsavedChangesNotifier: UnsavedChangesModal,
    uploadProgress: UploadProgressModal,
    downloadProgess: DownloadProgressModal,
  }

  const ModalComponent = modals[modal]

  return ModalComponent ? <ModalComponent {...props} /> : null 
}

export default ModalRenderer
