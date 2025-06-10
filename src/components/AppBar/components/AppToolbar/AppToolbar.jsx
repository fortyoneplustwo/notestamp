import React, { useEffect, useState } from "react"
import { useSaveProject } from "@/hooks/useWriteData"
import { useDeleteProject } from "@/hooks/useUpdateData"
import { useGetProjectNotes } from "@/hooks/useReadData"
import { useModal } from "@/context/ModalContext"
import { useProjectContext } from "@/context/ProjectContext"
import { useAppContext } from "@/context/AppContext"
import { CircleX, Save, Trash } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const AppToolbar = ({ metadata, onClose }) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { openModal, closeModal } = useModal()
  const { user, cwd, refetchAllProjects } = useAppContext()
  const { saveWithData, error: saveError } = useSaveProject()
  const { deleteById, error: deleteError } = useDeleteProject()
  const { fetchById: fetchNotesById } = useGetProjectNotes()
  const { takeSnapshot } = useProjectContext()
  const [toastId, setToastId] = useState(null)

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleDeleteProject = () => {
    const snapshot = takeSnapshot()
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: async () => {
        try {
          setIsDeleting(true)
          closeModal()
          onClose()
          await deleteById(snapshot.metadata?.title)
          setIsDeleting(false)
          if (deleteError) throw new Error()
          toast.success("Project deleted", {
            id: toastId,
          })
        } catch (error) {
          console.error(error)
          toast.error("Failed to delete project")
        }
      },
    })
  }

  const handleSaveProject = () => {
    const snapshot = takeSnapshot()

    // Case: Existitng project
    if (metadata?.title) {
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

    // Case: New project
    openModal("projectSaver", {
      metadata: { ...snapshot.metadata },
      onClose: closeModal,
      onSave: async title => {
        if (!snapshot.metadata && !snapshot.src) {
          toast.warning("No media detected")
          return
        }

        if (!snapshot.metadata || !snapshot.notes) {
          closeModal()
          toast.error("Invalid project")
          return
        }

        setIsSaving(true)
        closeModal()
        const id = toast.loading("Saving project")
        await saveWithData({
          metadata: { ...snapshot.metadata, title },
          media: snapshot.media,
          notes: snapshot.notes,
        })
        setIsSaving(false)
        if (saveError) {
          toast.error("Save failed", { id })
          return
        }
        toast.success("Project saved", { id })
        refetchAllProjects()
      },
    })
  }

  const handleCloseProject = async () => {
    if (!metadata?.title) return onClose()

    try {
      const snapshot = takeSnapshot()
      const cachedNotes = await fetchNotesById(metadata.title)
      if (cachedNotes || cachedNotes === JSON.stringify(snapshot?.notes)) {
        return onClose()
      }

      openModal("unsavedChangesModal", {
        onClose: closeModal,
        onSave: () => {
          closeModal()
          handleSaveProject()
        },
        onDiscard: () => {
          closeModal()
          onClose()
        },
      })
    } catch (error) {
      console.error(error)
      onClose()
    }
  }

  return (
    <span className="flex flex-row h-full grow gap-4">
      <span
        className="font-bold self-center truncate overflow-hidden whitespace-nowrap"
        style={{
          maxWidth: `${
            viewportWidth > 1000 ? viewportWidth / 2.5 : viewportWidth / 4.5
          }px`,
        }}
      >
        <Label className="text-sm">{metadata?.title || metadata?.label}</Label>
      </span>
      {metadata && (
        <span data-tour-id="toolbar" className="flex flex-row gap-3 ml-auto">
          {(user || cwd) && (
            <>
              {metadata?.type !== "recorder" && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleSaveProject}
                  disabled={isSaving}
                >
                  <Save size={16} /> Save
                </Button>
              )}
              {metadata?.title && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                >
                  <Trash size={16} /> Delete
                </Button>
              )}
            </>
          )}
          <Button
            variant="destructive"
            size="xs"
            className="close-btn"
            onClick={handleCloseProject}
          >
            <CircleX size={16} /> Close
          </Button>
        </span>
      )}
      <Separator orientation="vertical" />
    </span>
  )
}

export default AppToolbar
