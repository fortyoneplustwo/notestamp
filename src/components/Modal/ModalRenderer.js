import React, { forwardRef } from "react"
import DeleteModal from "./modals/DeleteModal"
import DownloadProgressModal from "./modals/DownloadProgressModel"
import LoginModal from "./modals/LoginModal"
import NotesUploaderModal from "./modals/NotesUploaderModal"
import RegisterModal from "./modals/RegisterModal"
import SaveModal from "./modals/SaveModal"
import UnsavedChangesModal from "./modals/UnsavedChangesModal"
import UploadProgressModal from "./modals/UploadProgressModal"

const ModalRenderer = forwardRef(({ modal, props }, ref) => {
  const modals = {
    notesUploader: NotesUploaderModal,
    projectSaver: SaveModal,
    deleteModal: DeleteModal,
    unsavedChangesNotifier: UnsavedChangesModal,
    uploadProgress: UploadProgressModal,
    downloadProgess: DownloadProgressModal,
    loginModal: LoginModal,
    registerModal: RegisterModal,
  }

  const ModalComponent = modals[modal]

  return ModalComponent ? <ModalComponent {...props} ref={ref} /> : null 
})

export default ModalRenderer
