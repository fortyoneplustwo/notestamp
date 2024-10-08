import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

const ProjectContext = createContext()

export const useProjectContext = () => useContext(ProjectContext)

export const ProjectProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isMediaMounted, setIsMediaMounted] = useState(false)
  const [isEditorMounted, setIsEditorMounted] = useState(false)
  const [metadata, setMetadata] = useState(null)
  const [notes, setNotes] = useState(null)
  const [media, setMedia] = useState(null)
  const mediaRef = useRef(null) 
  const editorRef = useRef(null)

  const takeSnapshot = useCallback(() => {
    setNotes(editorRef.current?.getContent())
    setMedia(mediaRef.current?.getMedia())
    setMetadata(mediaRef.current?.getMetadata())
  }, [])

  useEffect(() => {
    if (isMediaMounted && isEditorMounted) {
      setIsMounted(true)
      takeSnapshot()
    } else {
      setIsMounted(false)
    }
  }, [isMediaMounted, isEditorMounted, takeSnapshot])

  const getMetadata = useCallback(() => mediaRef.current?.getMetadata(), [])
  const getNotes = useCallback(() => editorRef.current?.getContent(), [])
  const getMedia = useCallback(() => mediaRef.current?.getMedia(), [])

  const setMediaRef = useCallback((node) => {
    setIsMediaMounted(() => {
      mediaRef.current = node
      return !!node
    })
  }, [setIsMediaMounted])

  const setEditorRef = useCallback((node) => {
    setIsEditorMounted(() => {
      editorRef.current = node
      return !!node
    })
  }, [setIsEditorMounted])

  return (
    <ProjectContext.Provider value={{ 
      notes,
      media,
      metadata,
      setMediaRef,
      setEditorRef,
      getMetadata,
      getNotes,
      getMedia,
      isMounted
    }}>
      { children }
    </ProjectContext.Provider>
  )
}
