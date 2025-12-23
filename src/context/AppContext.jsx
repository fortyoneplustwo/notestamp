import { create } from "zustand"

export const useAppContext = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  syncToFileSystem: false,
  setSyncToFileSystem: (shouldSync) => set({ syncToFileSystem: shouldSync }),
  cwd: null,
  setCwd: (dir) => set({ cwd: dir }),
  mediaRef: { current: null },
  setMediaRef: (ref) => set((state) => {
    state.current = ref;
    return { mediaRef: state }
  }),
  error: null,
  setError: (err) => set({ error: err }),
  triggerRefetchAllProjects: false,
  refetchAllProjects: () => set((state) => ({ triggerRefetchAllProjects: !state.triggerRefetchAllProjects })),
}))

