/* eslint-disable react/jsx-key */

import React, { useEffect, useRef, useState } from "react"
import { Toolbar as Container } from "@/components/MediaRenderer/components/Toolbar"
import { MarkButton } from "./components/MarkButton"
import { BlockButton } from "./components/BlockButton"
import { ActionButton } from "./components/ActionButton"
import { useLists } from "../../plugins/withLists"
import { useMarks } from "../../plugins/withMarks"
import { useSlate } from "slate-react"
import { Bold } from "lucide-react"
import { Italic } from "lucide-react"
import { Underline } from "lucide-react"
import { Code } from "lucide-react"
import { ListOrdered } from "lucide-react"
import { List } from "lucide-react"
import { FileDown } from "lucide-react"
import { Command } from "lucide-react"
import { ArrowBigUp } from "lucide-react"
import { useProjectContext } from "@/context/ProjectContext"
import { MediaControlsMenu } from "./components/MediaControlsMenu"

const modules = import.meta.glob("../../utils/pdfDownloader.jsx", {
  import: "downloadPdf",
})

export const Toolbar = () => {
  const editor = useSlate()
  const { marks } = useMarks()
  const { lists } = useLists()
  const downloadPdf = useRef()

  const { currProjectConfig } = useProjectContext()
  const [mediaHotkeys, setMediaHotkeys] = useState(null)

  useEffect(() => {
    const loadPdfDownloader = async () => {
      try {
        const path = "../../utils/pdfDownloader.jsx"
        downloadPdf.current = await modules[path]()
      } catch (err) {
        console.error("Failed to load pdf downloader module:", err)
      }
    }
    loadPdfDownloader()
  }, [])

  useEffect(() => {
    if (currProjectConfig) {
      setMediaHotkeys(currProjectConfig?.hotkeys)
    }

    return () => {
      setMediaHotkeys(null)
    }
  }, [currProjectConfig])

  const Key = ({ children }) => (
    <kbd
      className={`
        inline-flex justify-center items-center dark:bg-gray-300 border
        border-transparent font-mono text-xs/none dark:text-gray-800 rounded-xs 
        bg-neutral-700 text-neutral-200
      `}
    >
      {children}
    </kbd>
  )

  const Title = ({ description, hotkeys }) => {
    const keys = hotkeys.map((k, index) => <Key key={index}>{k}</Key>)
    return (
      <span className="inline-flex items-center gap-3">
        {description}
        {keys?.length > 0 && (
          <span className="inline-flex items-center gap-0.5">{keys}</span>
        )}
      </span>
    )
  }

  const KeyIcon = ({ icon: Icon }) => <Icon className="inline" size={12} />

  return (
    <Container>
      <div className="flex gap-5">
        <MarkButton
          format={marks.bold}
          icon={Bold}
          aria-label="Toggle Bold"
          title={
            <Title
              description="Bold"
              hotkeys={[<KeyIcon icon={Command} />, "B"]}
            />
          }
        />
        <MarkButton
          format={marks.italic}
          icon={Italic}
          aria-label="Italic"
          title={
            <Title
              description="Toggle italic"
              hotkeys={[<KeyIcon icon={Command} />, "I"]}
            />
          }
        />
        <MarkButton
          format={marks.underline}
          icon={Underline}
          aria-label="Toggle Underline"
          title={
            <Title
              description="Underline"
              hotkeys={[<KeyIcon icon={Command} />, "U"]}
            />
          }
        />
        <MarkButton
          format={marks.code}
          icon={Code}
          aria-label="Toggle Inline Code"
          title={
            <Title
              description="Inline code"
              hotkeys={[<KeyIcon icon={Command} />, "`"]}
            />
          }
        />
        <BlockButton
          format={lists.numberedList}
          icon={ListOrdered}
          aria-label="Toggle Numbered List"
          title={
            <Title
              description="Numbered list"
              hotkeys={[
                <KeyIcon icon={Command} />,
                <KeyIcon icon={ArrowBigUp} />,
                "8",
              ]}
            />
          }
        />
        <BlockButton
          format={lists.bulletedList}
          icon={List}
          aria-label="Toggle Bulleted List"
          title={
            <Title
              description="Bulleted list"
              hotkeys={[
                <KeyIcon icon={Command} />,
                <KeyIcon icon={ArrowBigUp} />,
                "9",
              ]}
            />
          }
        />
      </div>
      <div className="flex gap-5 ml-auto">
        <ActionButton
          icon={FileDown}
          aria-label="Download PDF"
          title="Export notes as PDF"
          onClick={async () => downloadPdf.current?.(editor)}
        />
        {mediaHotkeys && <MediaControlsMenu data={mediaHotkeys} />}
      </div>
    </Container>
  )
}
