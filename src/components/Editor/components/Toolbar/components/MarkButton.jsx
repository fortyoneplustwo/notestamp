import { Editor } from "slate"
import { useSlate } from "slate-react"
import { Button, Icon } from "./ui"

export const useMarkButton = () => {
  const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format)
    editor.toggleMark(isActive, format)
  }

  return { isMarkActive, toggleMark }
}

export const MarkButton = ({ format, icon, ...props }) => {
  const editor = useSlate()
  const { isMarkActive, toggleMark } = useMarkButton()
  return (
    <Button
      {...props}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
