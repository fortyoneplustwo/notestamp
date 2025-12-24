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
import { useNavigate, useRouteContext } from "@tanstack/react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createProject } from "@/lib/fetch/api-write"
import { updateProject } from "@/lib/fetch/api-update"
import { deleteProject } from "@/lib/fetch/api-delete"
import { fetchNotes } from "@/lib/fetch/api-read"

const AppToolbar = () => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const { openModal, closeModal } = useModal()
  const { user, cwd } = useAppContext()
  const { activeProject, takeSnapshot } = useProjectContext()
  const navigate = useNavigate()
  const { queryClient } = useRouteContext({})
  const { data: fetchedNotes } = useQuery({
    queryFn: projectId => fetchNotes(projectId),
    queryKey: ["notes", activeProject?.title],
    enabled: !!activeProject?.title,
  })

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const saveNewProject = useMutation({
    mutationFn: data => createProject(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    onError: error => console.error(error),
  })
  const saveExistingProject = useMutation({
    mutationFn: data => updateProject(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.metadata.title],
      })
    },
    onError: error => console.error(error),
  })
  const removeProject = useMutation({
    mutationFn: data => deleteProject(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      navigate({ from: "/", to: "/dashboard" })
    },
    onError: error => console.error(error),
  })

  const handleDeleteProject = () => {
    const snapshot = takeSnapshot()
    openModal("deleteModal", {
      onClose: closeModal,
      onDelete: async () => {
        closeModal()
        toast.promise(
          removeProject.mutateAsync({ id: snapshot.metadata.title }),
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

    // Case: Existitng project
    if (activeProject?.title) {
      if (!snapshot.metadata || !snapshot.notes) {
        toast.error("Invalid project")
        return
      }
      const filteredMetadata = filterMetadata(snapshot.metadata, validKeys)
      toast.promise(
        saveExistingProject.mutateAsync({
          metadata: { ...filteredMetadata },
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
        if (!snapshot.media && !snapshot.src) {
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
          saveNewProject.mutateAsync({
            metadata: { ...filteredMetadata, title },
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
    const prevRoute = cwd || user ? "/dashboard" : "/"
    if (!activeProject?.title) return navigate({ to: prevRoute })

    try {
      const snapshot = takeSnapshot()
      if (fetchedNotes === JSON.stringify(snapshot?.notes)) {
        return navigate({ to: prevRoute })
      }

      openModal("unsavedChangesModal", {
        onClose: closeModal,
        onSave: () => {
          closeModal()
          handleSaveProject()
        },
        onDiscard: () => {
          closeModal()
          navigate({ to: prevRoute })
        },
      })
    } catch (error) {
      console.error(error)
      navigate({ to: prevRoute })
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
        <Label className="text-sm">
          {activeProject?.title || activeProject?.label}
        </Label>
      </span>
      {activeProject && (
        <span data-tour-id="toolbar" className="flex flex-row gap-3 ml-auto">
          {(user || cwd) && (
            <>
              {activeProject?.type !== "recorder" && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleSaveProject}
                  disabled={
                    saveNewProject.isPending || saveExistingProject.isPending
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
                  disabled={removeProject.isPending}
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
