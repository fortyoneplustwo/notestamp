import React, { useEffect, useState } from 'react'
import Button from '../../../Button/Button'
import { useSaveProject } from "../../../../hooks/useWriteData"
import { useDeleteProject } from '../../../../hooks/useUpdateData'
import { useModal } from '../../../../context/ModalContext'
import { useProjectContext } from "../../../../context/ProjectContext"
import { useAppContext } from '../../../../context/AppContext'

const AppToolbar = ({ metadata, onClose }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { user, cwd} = useAppContext()
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
      metadata: { ...snapshot.metadata },
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
    <span className="flex flex-row h-full flex-grow gap-4">
      <span className="text-sm font-bold self-center">
        { metadata?.title || metadata?.label }
      </span>
      <span className="flex flex-row gap-3 ml-auto">
        {(user || cwd) && (
          <>
            <Button
              icon="save"
              onClick={handleSaveProject}
              style={{ disabled: isSaving, border: 'none' }}
            >
              Save 
            </Button>
            {metadata?.title && (
              <Button 
                icon="delete"
                onClick={handleDeleteProject}
                style={{ disabled: isDeleting, border: 'none', }}
              >
                Delete
              </Button>
            )}
          </>
        )}
        <Button
          onClick={onClose}
          icon={"cancel"}
          style={{ border: 'none' }}
        >
          Close
        </Button>
      </span>
    </span>
  )
}

export default AppToolbar
