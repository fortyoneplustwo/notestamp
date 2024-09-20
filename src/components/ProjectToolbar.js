import React, { useEffect, useState } from 'react'
import AppToolbarButton from './button/AppToolbarButton'
import { useGetUserData } from "../hooks/useReadData"
import { useSaveProject } from "../hooks/useWriteData"
import { useDeleteProject, useUpdateProject } from '../hooks/useUpdateData'
import { useModal } from './modal/ModalContext'
import { useProjectContext } from "./context/ProjectContext"

const ProjectToolbar = ({ label, title, onClose }) => {
  const [refetchUserCount, setRefetchUserCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { data: user, fetchData: refetchUser, error: userError } = useGetUserData()
  const { saveWithData, loading: loadingSave, error: saveError } = useSaveProject()
  const { updateWithData, loading: loadingUpdate, error: updateError } = useUpdateProject()
  const { deleteById, loading: loadingDelete, error: deleteError } = useDeleteProject()
  const { metadata, media, notes, takeSnapshot, isMounted: isProjectMounted } = useProjectContext()

  useEffect(() => {
    if (isProjectMounted) {
      takeSnapshot()
    }
  }, [isProjectMounted, takeSnapshot])

  useEffect(() => {
    if (userError && refetchUserCount <= 1) {
      refetchUser()
      setRefetchUserCount(refetchUserCount + 1)
    }
  }, [userError, refetchUserCount, refetchUser])

  useEffect(() => {
    if (!loadingSave) {
      setIsSaving(false)
      if (saveError) {
        // handle error
      }
      closeModal()
    }
  }, [loadingSave, saveError, closeModal])

  useEffect(() => {
    if (!loadingDelete) {
      setIsDeleting(false)
      if (deleteError) {
        // handle error
      }
      closeModal()
      onClose()
    }
  }, [loadingDelete, deleteError, closeModal, onClose])

  useEffect(() => {
    if (!loadingUpdate) {
      setIsUpdating(false)
      if (updateError) {
        // handle error
      }
      closeModal()
    }
  }, [loadingUpdate, updateError, closeModal])

  const handleDeleteProject = () => {
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: () => {
        setIsDeleting(true)
        deleteById(metadata.title)
      },
    })
  }

  const handleSaveProject = () => {
    takeSnapshot()
    openModal("projectSaver", {
      onClose: closeModal,
      onSave: (title) => {
        if (!metadata || !notes || !title) {
          closeModal()
          return
        }

        if (metadata?.title) {
          setIsUpdating(true)
          updateWithData({
            metadata: { ...metadata, title },
            media: media,
            notes: notes,
          })
        } else {
          setIsSaving(true)
          saveWithData({
            metadata: { ...metadata, title },
            media: media,
            notes: notes,
          })
        }
        openModal("uploadProgress")
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
          <AppToolbarButton
            label={"Save"}
            onClick={handleSaveProject}
            style={{ disabled: isSaving || isUpdating }}
          />
          {metadata?.title && (
            <AppToolbarButton 
              label={"Delete"} 
              onClick={handleDeleteProject}
              style={{ disabled: isDeleting }}
            />
          )}
        </>
      )}
    </span>
  )
}

export default ProjectToolbar
