import React, { useContext, useState, createContext, useRef, useEffect, useCallback } from "react"
import ModalRenderer from "./ModalRenderer"

const ModalContext = createContext()

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null)
  const [modalProps, setModalProps] = useState({})
  const modalRef = useRef(null)

  useEffect(() => {
    if (modal && modalProps && modalRef.current) {
      modalRef.current.showModal()
    }
  }, [modal, modalProps])

  const openModal = useCallback((modalType, props = {}) => {
    setModal(modalType)
    setModalProps(props)
  }, [])

  const closeModal = useCallback(() => {
    modalRef.current = null
    setModal(null)
    setModalProps({})
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      { children }
      { modal && (
        <ModalRenderer  
          modal={modal} 
          props={modalProps} 
          ref={modalRef} 
        /> 
      )}
    </ModalContext.Provider>
  )
}
