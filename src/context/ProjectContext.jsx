import { useContent } from "@/components/Editor/hooks/useContent"
import {
  createContext,
  useCallback,
  use,
  useEffect,
  useRef,
  useState,
} from "react"

const ProjectContext = createContext()

export const useProjectContext = () => use(ProjectContext)

export const ProjectProvider = ({ currProjectConfig, children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isMediaMounted, setIsMediaMounted] = useState(false)
  const [isEditorMounted, setIsEditorMounted] = useState(false)
  const mediaRef = useRef(null)
  const editorRef = useRef(null)
  const { getContent } = useContent()

  useEffect(() => {
    if (isMediaMounted && isEditorMounted) {
      setIsMounted(true)
    } else {
      setIsMounted(false)
    }
  }, [isMediaMounted, isEditorMounted])

  const takeSnapshot = useCallback(() => {
    return {
      metadata: mediaRef.current?.getMetadata?.(),
      notes: editorRef.current && getContent(editorRef.current),
      media: mediaRef.current?.getMedia?.(),
    }
  }, [])

  const handleMediaHotkey = useCallback(event => {
    return mediaRef?.current?.handleHotkey?.(event)
  }, [])

  const setMediaRef = useCallback(
    node => {
      setIsMediaMounted(() => {
        mediaRef.current = node
        return !!node
      })
    },
    [setIsMediaMounted]
  )

  const setEditorRef = useCallback(
    node => {
      setIsEditorMounted(() => {
        editorRef.current = node
        return !!node
      })
    },
    [setIsEditorMounted]
  )

  return (
    <ProjectContext
      value={{
        setMediaRef,
        setEditorRef,
        isMounted,
        takeSnapshot,
        handleMediaHotkey,
        currProjectConfig,
      }}
    >
      {children}
    </ProjectContext>
  )
}
