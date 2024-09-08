import React, { useContext, useState, createContext } from "react"
import ModalRenderer from "./ModalRenderer"

const ModalContext = createContext()

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null)
  const [modalProps, setModalProps] = useState({})

  const openModal = (modalType, props = {}) => {
    setModal(modalType)
    setModalProps(props)
  }

  const closeModal = () => {
    setModal(null)
    setModalProps({})
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }} >
      { children }
      { modal && <ModalRenderer modal={modal} props={modalProps} /> }
    </ModalContext.Provider>
  )
}
