import React from "react"
import { Menu } from "./components/ui"
import { MarkButton } from "./components/MarkButton"
import { BlockButton } from "./components/BlockButton"
import { ActionButton } from "./components/ActionButton"
import { useLists } from "../../plugins/withLists"
import { useMarks } from "../../plugins/withMarks"
import { downloadPdf } from "../../utils/pdfDownloader"
import { useSlate } from "slate-react"

export const Toolbar = () => {
  const editor = useSlate()
  const { marks } = useMarks()
  const { lists } = useLists()

  return (
    <div
      className="flex p-[10px] dark:border-[#3f3f46] dark:bg-mybgter bg-[#f98fa] border-b border-b-[lightgray]"
    >
      <Menu>
        <MarkButton
          format={marks.bold}
          icon="format_bold"
          title='Bold (Ctrl+B)'
        />
        <MarkButton
          format={marks.italic}
          icon="format_italic"
          title="Italic (Ctrl+I)"
        />
        <MarkButton
          format={marks.underline}
          icon="format_underlined"
          description="Underline (Ctrl+U)"
        />
        <MarkButton
          format={marks.code}
          icon="code"
          title="Plain Text (Ctrl+`)"
        />
        <BlockButton
          format={lists.numberedList}
          icon="format_list_numbered"
          title="Numbered list (Ctrl+Shift+8)"
        />
        <BlockButton
          format={lists.bulletedList}
          icon="format_list_bulleted"
          title="Bulleted list (Ctrl+Shift+9)"
        />
      </Menu>
      <Menu className="ml-auto">
        <ActionButton
          icon="picture_as_pdf"
          title="Export to PDF"
          onClick={async () => downloadPdf(editor)}
        />
      </Menu>
    </div>
  )
}
