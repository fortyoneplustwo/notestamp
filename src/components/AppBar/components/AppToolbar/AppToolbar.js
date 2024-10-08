import React, { useEffect, useState } from 'react'
import AppToolbarButton from '../../../Button/AppToolbarButton'
import { useSaveProject } from "../../../../hooks/useWriteData"
import { useDeleteProject } from '../../../../hooks/useUpdateData'
import { useModal } from '../../../Modal/ModalContext'
import { useProjectContext } from "../../../../context/ProjectContext"
import { useAppContext } from '../../../../context/AppContext'

const AppToolbar = ({ title, onClose }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { user } = useAppContext()
  const { saveWithData, loading: loadingSave, error: saveError } = useSaveProject()
  const { deleteById, loading: loadingDelete, error: deleteError } = useDeleteProject()
  const { metadata, getMetadata, getNotes, getMedia } = useProjectContext()

  useEffect(() => {
    if (!loadingSave) {
      setIsSaving(false)
      if (saveError) {
        // handle error and return
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

  const handleDeleteProject = () => {
    const currMetadata = getMetadata()
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: () => {
        setIsDeleting(true)
        deleteById(currMetadata?.title)
      },
    })
  }

  const handleSaveProject = () => {
    const currMetadata = getMetadata()
    const currNotes = getNotes()
    const currMedia = getMedia()
    openModal("projectSaver", {
      onClose: closeModal,
      onSave: (title) => {
        if (!currMetadata || !currNotes || !title) {
          closeModal()
          return
        }
        setIsSaving(true)
        saveWithData({
          metadata: { ...currMetadata, title },
          media: currMedia,
          notes: currNotes,
        })
        openModal("uploadProgress")
      },
    })
  }

  return (
    <span className="flex gap-4">
      <span className="text-sm text-bold self-center">
        { title || metadata?.label }
      </span>
      <AppToolbarButton
        label={"Close"}
        onClick={onClose}
      />
      {user && (
        <>
          <AppToolbarButton
            label={"Save"}
            onClick={handleSaveProject}
            style={{ disabled: isSaving }}
          />
          {title && (
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

export default AppToolbar
