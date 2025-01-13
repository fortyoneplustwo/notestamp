import React, { useEffect, useState } from 'react'
import { useSaveProject } from '@/hooks/useWriteData'
import { useDeleteProject } from '@/hooks/useUpdateData'
import { useGetProjectNotes } from '@/hooks/useReadData'
import { useModal } from '@/context/ModalContext'
import { useProjectContext } from '@/context/ProjectContext'
import { useAppContext } from '@/context/AppContext'
import { AppBarButton } from '@/components/Button/Button'
import { CircleX, Save, Trash } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const AppToolbar = ({ metadata, onClose }) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { user, cwd } = useAppContext()
  const { saveWithData, loading: loadingSave, error: saveError } = useSaveProject()
  const { deleteById, loading: loadingDelete, error: deleteError } = useDeleteProject()
  const { fetchById: fetchNotesById } = useGetProjectNotes()
  const { takeSnapshot } = useProjectContext()
  const [toastId, setToastId] = useState(null)

  useEffect(() => {
    if (!loadingSave) {
      setIsSaving(false)
      if (saveError) {
        toast.error("Save failed", {
          id: toastId,
        })
        return
      }
      toast.success("Project saved", {
        id: toastId,
      })
    }
  }, [loadingSave, saveError, closeModal])

  useEffect(() => {
    if (!loadingDelete) {
      setIsDeleting(false)
      if (deleteError) {
        toast.error("Delete failed")
        return
      }
      toast.success("Project deleted", {
        id: toastId,
      })
      onClose()
    }
  }, [loadingDelete, deleteError, closeModal, onClose])

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleDeleteProject = () => {
    const snapshot = takeSnapshot()
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: () => {
        setIsDeleting(true)
        deleteById(snapshot.metadata?.title)
        closeModal()
      },
    })
  }

  const handleSaveProject = () => {
    const snapshot = takeSnapshot()

    if (metadata?.title) { // Case: existing project
      if (!snapshot.metadata || !snapshot.notes) {
        closeModal()
        toast.error("Invalid project")
        return
      }
      saveWithData({
        metadata: { ...snapshot.metadata },
        notes: snapshot.notes,
      })
      const id = toast.loading("Saving project")
      setToastId(id)
      return
    }

    openModal("projectSaver", { // Case: new project
      metadata: { ...snapshot.metadata },
      onClose: closeModal,
      onSave: (title) => {
        // TODO: fix this
        if ((snapshot.metadata.type === "youtube" && !snapshot.metadata.src) ||
          (snapshot.metadata.type !== "youtube" && !snapshot.media)) {
          toast.warning("No media detected")
          return
        }

        if (!snapshot.metadata || !snapshot.notes) {
          closeModal()
          toast.error("Invalid project")
          return
        }

        setIsSaving(true)
        saveWithData({
          metadata: { ...snapshot.metadata, title },
          media: snapshot.media,
          notes: snapshot.notes,
        })
        closeModal()
        const id = toast.loading("Saving project")
        setToastId(id)
      },
    })
  }

  // This is a temporary implementation to test functionality
  // TODO: rewrite this when caching has been reworked
  const handleCheckForUnsavedChanges = async () => {
    const snapshot = takeSnapshot()
    const cachedNotesFile = await fetchNotesById(metadata.title)

    if (cachedNotesFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const cachedNotes = e.target.result
        if (cachedNotes !== JSON.stringify(snapshot?.notes)) {
          openModal("unsavedChangesModal", {
            onClose: closeModal,
            onSave: () => {
              closeModal()
              handleSaveProject()
            },
            onDiscard: () => {
              closeModal()
              onClose()
            }
          })
        } else {
          onClose()
        }
      }
      reader.readAsText(cachedNotesFile)
    }
  }

  const handleCloseProject = async () => {
    if (!metadata?.title) {
      onClose()
    } else {
      await handleCheckForUnsavedChanges()
    }
  }

  return (
    <span className="flex flex-row h-full flex-grow gap-4">
      <span 
        className="font-bold self-center truncate overflow-hidden whitespace-nowrap"
        style={{ 
          maxWidth: `${viewportWidth > 1000 
            ? viewportWidth / 2.5 
            : viewportWidth / 4.5}px`
        }}
      >
        <Label className="text-sm">{ metadata?.title || metadata?.label }</Label>
      </span>
      <span className="flex flex-row gap-3 ml-auto">
        {(user || cwd) && (
          <>
            {metadata?.type !== "recorder" && (
              <AppBarButton
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                <Save size={16} /> Save 
              </AppBarButton>
            )}
            {metadata?.title && (
              <AppBarButton 
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                <Trash size={16} /> Delete
              </AppBarButton>
            )}
          </>
        )}
        <AppBarButton
          variant="destructive"
          onClick={handleCloseProject}
        >
          <CircleX size={16} /> Close
        </AppBarButton>
      </span>
      <Separator orientation="vertical" />
    </span>
  )
}

export default AppToolbar
