import { useMutation } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { createProject } from "@/lib/fetch/api-write"
import { updateProject } from "@/lib/fetch/api-update"
import { deleteProject } from "@/lib/fetch/api-delete"
import { useProjectContext } from "@/context/ProjectContext"

export const useAddProjectMutation = () => {
  const { queryClient } = useRouteContext({})

  const mutation = useMutation({
    mutationFn: data => {
      return createProject(data)
    },
    onMutate: newProject => {
      const projectId = newProject.metadata.title
      // First cancel any ongoing mutations
      queryClient.cancelQueries(["metadata", projectId])
      queryClient.cancelQueries(["media", projectId])
      queryClient.cancelQueries(["notes", projectId])
      // Optimistically update project data
      queryClient.setQueryData(["metadata", projectId], newProject.metadata)
      queryClient.setQueryData(["media", projectId], newProject.media)
      queryClient.setQueryData(
        ["notes", projectId],
        JSON.stringify(newProject.notes)
      )
    },
    onSuccess: (data, variables) => {
      const projectId = variables.metadata.title
      queryClient.invalidateQueries({
        queryKey: ["metadata", projectId],
        refetchType: "none", // Mark as stale, but only refetch on next mount
      })
      queryClient.invalidateQueries({
        queryKey: ["media", projectId],
        refetchType: "none",
      })
      queryClient.invalidateQueries({
        queryKey: ["notes", projectId],
        refetchType: "none",
      })
    },
    onError: error => {
      console.error(error)
    },
    onSettled: () => {
      // Clear pending/error state in project list
      return queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    mutationKey: ["addProject"],
  })

  return mutation
}

export const useUpdateProjectMutation = () => {
  const { queryClient } = useRouteContext({})

  const mutation = useMutation({
    mutationFn: data => {
      return updateProject(data)
    },
    onMutate: variables => {
      const projectId = variables.metadata.title
      // First cancel any ongoing mutations
      queryClient.cancelQueries(["notes", projectId])
      // Optimistically update project data (notes only)
      queryClient.setQueryData(
        ["notes", projectId],
        JSON.stringify(variables.notes)
      )
    },
    onSuccess: (data, variables) => {
      const projectId = variables.metadata.title
      queryClient.invalidateQueries({
        queryKey: ["notes", projectId],
        refetchType: "none", // Mark as stale, but only refetch on next mount
      })
    },
    onError: error => {
      console.error(error)
    },
    onSettled: () => {
      // Clear pending/error state in project list
      return queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    mutationKey: ["updateProject"],
  })

  return mutation
}

export const useDeleteProjectMutation = () => {
  const { queryClient } = useRouteContext({})
  const { activeProject } = useProjectContext()

  const mutation = useMutation({
    mutationFn: data => {
      return deleteProject(data.id)
    },
    onMutate: () => {
      return activeProject
    },
    onSuccess: (data, variables) => {
      const projectId = variables.id
      queryClient.invalidateQueries({ queryKey: ["metadata", projectId] })
      queryClient.invalidateQueries({ queryKey: ["media", projectId] })
      queryClient.invalidateQueries({ queryKey: ["notes", projectId] })
    },
    onError: error => {
      console.error(error)
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    mutationKey: ["deleteProject"],
  })

  return mutation
}
