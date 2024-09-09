import { createContext, useContext, useEffect, useRef } from "react"

const ProjectContext = createContext()

export const useProjectContext = () => useContext(ProjectContext)

export const ProjectProvider = ({ children, media, editor }) => {
  const mediaRef = useRef(null) 
  const editorRef = useRef(null)

  useEffect(() => {
    mediaRef.current = media.current
    editorRef.current = editor.current
  }, [editor, media])

  const getNotes = () => editorRef?.current?.getContent()
  const getMetadata = () => mediaRef?.current?.getMetadata()
  const getMedia = () => mediaRef?.current?.getMedia()

  return (
    <ProjectContext.Provider value={{ getNotes, getMetadata, getMedia }}>
      { children }
    </ProjectContext.Provider>
  )
}
