import { create } from "zustand"

export const mediaRef = { current: null }
export const editorRef = { current: null }

export const useProjectContext = create((set) => ({
  activeProject: null,
  setActiveProject: (data) => set({ activeProject: data }),
  isMediaMounted: () => !!mediaRef.current,
  isEditorMounted: () => !!editorRef.current,
  setMediaRef: node => (mediaRef.current = node),
  setEditorRef: node => (editorRef.current = node),
  takeSnapshot: () => {
    return {
      metadata: mediaRef.current?.getMetadata?.(),
      notes: editorRef.current && structuredClone(editorRef.current.children),
      media: mediaRef.current?.getMedia?.(),
    }
  },
  handleMediaHotkey: (event) => mediaRef.current?.handleHotkey?.(event),
}))

