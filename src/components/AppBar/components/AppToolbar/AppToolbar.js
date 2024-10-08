import React, { useEffect, useState } from 'react'
import AppToolbarButton from '../../../Button/AppToolbarButton'
import { useSaveProject } from "../../../../hooks/useWriteData"
import { useDeleteProject } from '../../../../hooks/useUpdateData'
import { useModal } from '../../../Modal/ModalContext'
import { useProjectContext } from "../../../../context/ProjectContext"
import { useAppContext } from '../../../../context/AppContext'

const AppToolbar = ({ metadata, onClose }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { user } = useAppContext()
  const { saveWithData, loading: loadingSave, error: saveError } = useSaveProject()
  const { deleteById, loading: loadingDelete, error: deleteError } = useDeleteProject()
  const { takeSnapshot } = useProjectContext()

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
    const snapshot = takeSnapshot()
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: () => {
        setIsDeleting(true)
        deleteById(snapshot.metadata?.title)
      },
    })
  }

  const handleSaveProject = () => {
    const snapshot = takeSnapshot()
    openModal("projectSaver", {
      onClose: closeModal,
      onSave: (title) => {
        if (!snapshot.metadata || !snapshot.notes || !title) {
          closeModal()
          return
        }
        setIsSaving(true)
        saveWithData({
          metadata: { ...snapshot.metadata, title },
          media: snapshot.media,
          notes: snapshot.notes,
        })
        openModal("uploadProgress")
      },
    })
  }

  return (
    <span className="flex gap-4">
      <span className="text-sm text-bold self-center">
        { metadata?.title || metadata?.label }
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

export default AppToolbar
