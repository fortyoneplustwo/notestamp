import React from "react"
import { Toolbar as Container } from "@/components/MediaRenderer/components/Toolbar"
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
    <Container>
      <Menu>
        <MarkButton
          format={marks.bold}
          icon="format_bold"
          title="Bold (Ctrl+B)"
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
    </Container>
  )
}
