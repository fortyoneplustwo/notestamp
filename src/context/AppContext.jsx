import { create } from "zustand"

export const useAppContext = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  syncToFileSystem: false,
  setSyncToFileSystem: (shouldSync) => set({ syncToFileSystem: shouldSync }),
  cwd: null,
  setCwd: (dir) => set({ cwd: dir }),
  error: null,
  setError: (err) => set({ error: err }),
  triggerRefetchAllProjects: false,
  refetchAllProjects: () => set((state) => ({ triggerRefetchAllProjects: !state.triggerRefetchAllProjects })),
}))

