import { Editor } from "slate"
import { useSlate } from "slate-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "./Toggle"

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

export const MarkButton = ({ format, icon: Icon, title, ...props }) => {
  const editor = useSlate()
  const { isMarkActive, toggleMark } = useMarkButton()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          {...props}
          tabIndex={0}
          className="px-1"
          active={isMarkActive(editor, format)}
          aria-pressed={isMarkActive(editor, format)}
          onMouseDown={event => {
            event.preventDefault()
            toggleMark(editor, format)
          }}
        >
          <Icon size={16} />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  )
}
