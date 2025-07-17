import { Editor, Element } from "slate"
import { useSlate } from "slate-react"
import { useLists } from "../../../plugins/withLists"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "./Toggle"

export const useBlockButton = () => {
  const isBlockActive = (editor, format, blockType = "type") => {
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

export const BlockButton = ({ format, icon: Icon, title, ...props }) => {
  const editor = useSlate()
  const { isBlockActive, toggleBlock } = useBlockButton()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          {...props}
          tabIndex={0}
          className="px-1"
          active={isBlockActive(editor, format)}
          aria-pressed={isBlockActive(editor, format)}
          onMouseDown={event => {
            event.preventDefault()
            toggleBlock(editor, format)
          }}
        >
          <Icon size={16} />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  )
}
