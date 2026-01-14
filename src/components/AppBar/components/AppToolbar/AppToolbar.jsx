import React, { useEffect, useState } from "react"
import { useModal } from "@/context/ModalContext"
import { useProjectContext } from "@/context/ProjectContext"
import { useAppContext } from "@/context/AppContext"
import { CircleX, Save, Trash } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { filterMetadata } from "@/utils/makeMetadataForSave"
import { validKeys } from "@/config"
import {
  useBlocker,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router"
import {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "@/hooks/useProjectMutation"
import { useMutationState } from "@tanstack/react-query"

const AppToolbar = () => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)

  const { openModal, closeModal } = useModal()
  const { user, cwd } = useAppContext()
  const { activeProject, takeSnapshot } = useProjectContext()
  const navigate = useNavigate()
  const { queryClient } = useRouteContext({})

  const addProjectMutation = useAddProjectMutation()
  const updateProjectMutation = useUpdateProjectMutation()
  const deleteProjectMutation = useDeleteProjectMutation()

  const addProjectMutations = useMutationState({
    filters: { mutationKey: ["addProject"] },
    select: mut => ({
      title: mut.state.variables?.metadata?.title,
      status: mut.state.status,
    }),
  })

  useBlocker({
    shouldBlockFn: () => {
      const snapshot = takeSnapshot()
      if (!user && !cwd) return false

      if (!activeProject?.title) {
        const isMediaDirty = Boolean(snapshot.metadata?.src || snapshot.media)
        if(!isMediaDirty) {
          return false
        }
      }

      const isEditorDirty = 
        queryClient.getQueryData(["notes", activeProject.title]) !==
        JSON.stringify(snapshot?.notes)
      if (!isEditorDirty) {
        return false
      }

      const shouldBlock = new Promise(resolve => {
        openModal("unsavedChangesModal", {
          onClose: () => {
            closeModal()
            resolve(true)
          },
          onSave: () => {
            closeModal()
            handleSaveProject()
            resolve(false)
          },
          onDiscard: () => {
            closeModal()
            resolve(false)
          },
        })
      })
      return shouldBlock
    },
  })

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
        closeModal()
        toast.promise(
          deleteProjectMutation.mutateAsync({ id: snapshot.metadata.title }),
          {
            loading: "Deleting...",
            success: () => "Deleted!",
            error: "Failed to delete",
          }
        )
      },
    })
  }

  const handleSaveProject = async () => {
    const snapshot = takeSnapshot()

    // Case: Existing project
    if (
      activeProject?.title &&
      (!addProjectMutations.some(mut => mut.title === activeProject.title) ||
        addProjectMutations.find(mut => mut.title === activeProject.title)
          ?.status === "success")
    ) {
      if (!snapshot.metadata || !snapshot.notes) {
        toast.error("Invalid project")
        return
      }
      const filteredMetadata = filterMetadata(snapshot.metadata, validKeys)
      toast.promise(
        updateProjectMutation.mutateAsync({
          metadata: { ...filteredMetadata, lastModified: new Date().toISOString() },
          notes: snapshot.notes,
        }),
        {
          loading: "Saving...",
          success: () => "Saved!",
          error: "Failed to save",
        }
      )
      return
    }

    // Case: New project
    openModal("projectSaver", {
      metadata: { ...snapshot.metadata },
      onClose: closeModal,
      onSave: async title => {
        if (!snapshot.media && !snapshot.metadata?.src) {
          toast.warning("No media detected")
          return
        }

        if (!snapshot.metadata || !snapshot.notes) {
          closeModal()
          toast.error("Invalid project")
          return
        }

        const filteredMetadata = filterMetadata(snapshot.metadata, validKeys)
        closeModal()
        toast.promise(
          addProjectMutation.mutateAsync({
            metadata: {
              ...filteredMetadata,
              title,
              lastModified: new Date().toISOString(),
            },
            media: snapshot.media,
            notes: snapshot.notes,
          }),
          {
            loading: "Saving...",
            success: () => "Saved!",
            error: "Failed to save",
          }
        )
      },
    })
  }

  const handleCloseProject = async () => {
    navigate({ to: cwd || user ? "/dashboard" : "/" })
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
        <Label className="text-sm">
          {activeProject?.title || activeProject?.label}
        </Label>
      </span>
      <span data-tour-id="toolbar" className="flex flex-row gap-3 ml-auto">
        {(user || cwd) && !!activeProject && (
          <>
            {activeProject?.type !== "recorder" && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleSaveProject}
                disabled={
                  addProjectMutation.isPending ||
                  updateProjectMutation.isPending
                }
              >
                <Save size={16} /> Save
              </Button>
            )}
            {activeProject?.title && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleDeleteProject}
                disabled={deleteProjectMutation.isPending}
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
      <Separator orientation="vertical" />
    </span>
  )
}

export default AppToolbar
