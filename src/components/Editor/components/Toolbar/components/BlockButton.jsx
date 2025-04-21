import { Editor, Element } from "slate"
import { useSlate } from "slate-react"
import { Button, Icon } from "./ui"
import { useLists } from "../../../plugins/withLists"

export const useBlockButton = () => {
  const isBlockActive = (editor, format, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n[blockType] === format,
      })
    )
    return !!match
  }

  const toggleBlock = (editor, format) => {
    const { lists } = useLists()
    const isActive = isBlockActive(editor, format)
    const isList = Object.values(lists).includes(format)
    if (isList) {
      editor.toggleList(isActive, format)
    }
  }

  return { isBlockActive, toggleBlock }
}

export const BlockButton = ({ format, icon, ...props }) => {
  const editor = useSlate()
  const { isBlockActive, toggleBlock } = useBlockButton()

  return (
    <Button
      {...props}
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
