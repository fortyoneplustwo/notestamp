import { create } from "zustand"

export const useAppContext = create(set => ({
  user: null,
  setUser: newUser => set({ user: newUser }),
  syncToFileSystem: false,
  setSyncToFileSystem: shouldSync => set({ syncToFileSystem: shouldSync }),
  cwd: null,
  setCwd: dir => set({ cwd: dir }),
  isForwarding: false,
  setIsForwarding: val => set({ isForwarding: val }),
}))
