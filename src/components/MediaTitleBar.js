import React, { useEffect } from 'react'
import AppToolbarButton from './button/AppToolbarButton'
import { useGetUserData } from "../hooks/useReadData"
import { useSaveProject } from "../hooks/useWriteData"
import { useModal } from './modal/ModalContext'

const AppToolbar = ({ label, title, onClose }) => {
  const { openModal, closeModal } = useModal()
  const { data: user, fetchData: fetchUser, error: userError } = useGetUserData()
  const { saveWithData, loading: loadingSave, error: saveError } = useSaveProject()

  useEffect(() => {
    // TODO: need to handle error Modal
    // TODO: possibly only refetch once
    if (userError) {
      fetchUser()
    }
  }, [userError, fetchUser])

  const handleSaveProject = () => {
    // TODO: Need to check cache and decide whether to update or write
    // Assume cache is empty i.e. this is a new project for now

    // Get project data from global context

    // Open save modal
    openModal("projectSaver", {
      onClose: closeModal,
      onSave: () => {
        
      },
    })
  }

  return (
    <span className="flex gap-4">
      <span className="text-sm text-bold self-center">
        { title ? title : label }
      </span>
      <AppToolbarButton
        svgIcon={
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="orangered" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 3h18v18H3zM15 9l-6 6m0-6l6 6"/>
          </svg>
        }
        label={"Close"}
        onClick={onClose}
      />
      {user && (
        <>
          <AppToolbarButton label={"Save"} onClick={handleSaveProject}/>
        </>
      )}
    </span>
  )
}

export default AppToolbar
