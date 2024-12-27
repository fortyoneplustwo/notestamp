import React, { useContext, useState, createContext, useCallback } from "react"
import ModalRenderer from "./../components/Modal/ModalRenderer"

const ModalContext = createContext()

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null)
  const [modalProps, setModalProps] = useState({})

  const openModal = useCallback((modalType, props = {}) => {
    setModal(modalType)
    setModalProps({ ...props })
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      { children }
      { modal && (
        <ModalRenderer  
          modal={modal} 
          props={modalProps} 
        /> 
      )}
    </ModalContext.Provider>
  )
}
