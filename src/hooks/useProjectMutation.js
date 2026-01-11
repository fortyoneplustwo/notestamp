import { useMutation } from "@tanstack/react-query"
import { useNavigate, useRouteContext } from "@tanstack/react-router"
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
      // Optimistically update project data
      const projectId = newProject.metadata.title
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
      queryClient.invalidateQueries({ queryKey: ["projects"] })
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
      // Optimistically update project data (notes only)
      const projectId = variables.metadata.title
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
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    mutationKey: ["updateProject"],
  })

  return mutation
}

export const useDeleteProjectMutation = () => {
  const { queryClient } = useRouteContext({})
  const navigate = useNavigate()
  const { activeProject } = useProjectContext()

  const mutation = useMutation({
    mutationFn: data => {
        return deleteProject(data.id)
    },
    onMutate: () => {
      return activeProject
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metadata"] })
      queryClient.invalidateQueries({ queryKey: ["media"] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      navigate({ from: "/", to: "/dashboard" })
    },
    onError: error => {
      console.error(error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    mutationKey: ["deleteProject"],
  })

  return mutation
}
