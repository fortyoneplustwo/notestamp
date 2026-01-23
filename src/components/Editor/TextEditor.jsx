import React, { useMemo, useCallback, useState, useEffect } from "react"
import { Slate, Editable } from "slate-react"
import { Editor, Transforms, Element as SlateElement, Point } from "slate"
import isHotkey from "is-hotkey"
import { Toolbar } from "./components/Toolbar/Toolbar"
import { useProjectContext } from "../../context/ProjectContext"
import { useMarkButton } from "./components/Toolbar/components/MarkButton"
import { useBlockButton } from "./components/Toolbar/components/BlockButton"
import { useMarks, withMarks } from "./plugins/withMarks"
import { useLists, withLists } from "./plugins/withLists"
import { useStableFn, withStamps } from "slate-stamps"
import { StampedElement } from "./components/StampedElement"
import { useCopyPaste } from "./hooks/useCopyPaste"
import { useDebounce } from "@uidotdev/usehooks"

export const TextEditor = ({
  onStampInsert,
  onStampClick,
  editor: baseEditor,
}) => {
  const stableOnStampInsert = useStableFn(onStampInsert, [])
  const stableOnStampClick = useStableFn(onStampClick, [])

  const [editor] = useState(() =>
    withMarks(
      withLists(withStamps(baseEditor, stableOnStampInsert, stableOnStampClick))
    )
  )

  const initialValue = useMemo(
    () =>
      JSON.parse(sessionStorage.getItem("content")) || [
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ],
    []
  )
  const [value, setValue] = useState(initialValue)

  const { setEditorRef, handleMediaHotkey, isMediaMounted } =
    useProjectContext()
  const { toggleMark } = useMarkButton()
  const { toggleBlock } = useBlockButton()
  const { handleCopy, handlePaste } = useCopyPaste()
  const { marks } = useMarks()
  const { lists: listTypes, listItem: listItemType } = useLists()
  const debouncedValue = useDebounce(value, 500)

  const toolbarKeyShortcuts = new Map([
    ["mod+b", () => toggleMark(editor, marks.bold)],
    ["mod+i", () => toggleMark(editor, marks.italic)],
    ["mod+u", () => toggleMark(editor, marks.underline)],
    ["mod+`", () => toggleMark(editor, marks.code)],
    ["mod+shift+8", () => toggleBlock(editor, listTypes.numberedList)],
    ["mod+shift+9", () => toggleBlock(editor, listTypes.bulletedList)],
  ])
  const tab = "  " // 2 spaces

  useEffect(() => {
    setEditorRef(editor)

    return () => {
      setEditorRef(null)
    }
  }, [setEditorRef])

  useEffect(() => {
    const content = JSON.stringify(debouncedValue)
    sessionStorage.setItem("content", content)
  }, [debouncedValue])

  /**
   * Custom behaviour
   */
  const { deleteBackward } = editor

  // If the selection is at the start of a stamped line,
  // and the line above is an empty paragraph,
  // then we delete the empty paragraph,
  // essentially moving the content at and below the selection up by one line
  editor.deleteBackward = (...args) => {
    const { selection } = editor
    let match = Editor.above(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    })
    if (!match) throw Error("Could not find non-editor wrapping block")

    const [block, blockPath] = match
    const isSelectionAtBlockStart = Point.equals(
      selection.anchor,
      Editor.start(editor, blockPath)
    )
    const pointBefore = Editor.before(editor, selection.anchor)
    const isBlockEmpty = block =>
      block.children.length === 1 && block.children[0].text === ""

    match =
      pointBefore &&
      Editor.above(editor, {
        at: pointBefore,
        match: n => !Editor.isEditor(n) && Editor.isBlock(editor, n),
        mode: "lowest",
      })

    if (match) {
      const [blockAtPointBefore, blockPathAtPointBefore] = match
      if (
        isSelectionAtBlockStart &&
        block.type === editor.stampedElementType &&
        blockAtPointBefore.type === "paragraph" &&
        isBlockEmpty(blockAtPointBefore)
      ) {
        Transforms.removeNodes(editor, { at: blockPathAtPointBefore })
        return
      }
    }
    deleteBackward(...args)
  }

  // Disable soft breaks (Shift + Enter)
  editor.insertSoftBreak = () => {
    editor.insertBreak()
  }

  /**
   * Rendering
   */
  const Element = props => {
    const { children, element, attributes } = props
    switch (element.type) {
      case editor.stampedElementType:
        return <StampedElement onClick={stableOnStampClick} {...props} />
      case listTypes.numberedList:
        return (
          <ol {...attributes} className="list-decimal list-inside">
            {children}
          </ol>
        )
      case listTypes.bulletedList:
        return (
          <ul {...attributes} className="list-disc list-inside">
            {children}
          </ul>
        )
      case listItemType:
        return <li {...attributes}>{children}</li>
      default:
        return (
          <p {...attributes} style={{ margin: "0", padding: "0" }}>
            {children}
          </p>
        )
    }
  }

  const Leaf = props => {
    let { attributes, children, leaf } = props
    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.code) children = <code style={{ color: "grey" }}>{children}</code>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>
    return (
      <span
        // The following is a workaround for a Chromium bug where,
        // if you have an inline at the end of a block,
        // clicking the end of a block puts the cursor inside the inline
        // instead of inside the final {text: ''} node
        // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
        style={{ paddingLeft: leaf.text === "" ? "0.1px" : "null" }}
        {...attributes}
      >
        {children}
      </span>
    )
  }

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  /**
   * Key handlers
   */
  const handleKeyDown = event => {
    switch (event.key) {
      case "Tab":
        event.preventDefault()
        Transforms.insertText(editor, tab)
        break
      default:
        if (event.ctrlKey || event.metaKey) {
          for (const [hotkey, action] of toolbarKeyShortcuts.entries()) {
            if (isHotkey(hotkey, event)) {
              return action()
            }
          }
          if (isMediaMounted) {
            return handleMediaHotkey(event)
          }
        }
        break
    }
  }

  return (
    <div data-tour-id="editor" className="border-none bg-transparent h-full">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={val => {
          const isAstChange = editor.operations.some(
            op => "set_selection" !== op.type
          )
          if (isAstChange) {
            setValue(val)
          }
        }}
      >
        <div className="flex flex-col h-full">
          <Toolbar />
          <Editable
            className="overflow-x-hidden outline-hidden p-1 w-full h-full color-black bg-white dark:bg-mybgsec"
            style={{ tabSize: "2" }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={"Write here..."}
            spellCheck={true}
            onCopy={handleCopy(editor)}
            onPaste={handlePaste(editor)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </Slate>
    </div>
  )
}
