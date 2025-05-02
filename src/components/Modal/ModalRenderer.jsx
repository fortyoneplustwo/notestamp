import React from "react"
import DeleteModal from "./modals/DeleteModal"
import LoginModal from "./modals/LoginModal"
import RegisterModal from "./modals/RegisterModal"
import SaveModal from "./modals/SaveModal"
import UnsavedChangesModal from "./modals/UnsavedChangesModal"

const ModalRenderer = ({ modal, props }) => {
  const modals = {
    projectSaver: SaveModal,
    deleteModal: DeleteModal,
    unsavedChangesModal: UnsavedChangesModal,
    loginModal: LoginModal,
    registerModal: RegisterModal,
  }

  const ModalComponent = modals[modal]

  return ModalComponent ? <ModalComponent {...props} /> : null 
}

export default ModalRenderer
