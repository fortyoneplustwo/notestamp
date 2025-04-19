import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Slate, Editable } from 'slate-react'
import { Editor, Transforms, Element as SlateElement, Point } from 'slate'
import isHotkey from 'is-hotkey'
import { Toolbar } from './components/Toolbar/Toolbar'
import { useProjectContext } from '../../context/ProjectContext'
import { useMarkButton } from './components/Toolbar/components/MarkButton'
import { useBlockButton } from './components/Toolbar/components/BlockButton'
import { useMarks, withMarks } from './plugins/withMarks'
import { useLists, withLists } from './plugins/withLists'
import { useStableFn, withStamps } from 'slate-stamps'
import { StampedElement } from './components/StampedElement'
import { useCopyPaste } from './hooks/useCopyPaste'

export const TextEditor = ({
  onStampInsert,
  onStampClick,
  editor: baseEditor
}) => {
  const stableOnStampInsert = useStableFn(onStampInsert, [])
  const stableOnStampClick = useStableFn(onStampClick, [])

  const [editor] = useState(() =>
    withMarks(
      withLists(
        withStamps(
          baseEditor,
          stableOnStampInsert,
          stableOnStampClick
        ))))

  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('content')) || [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
    []
  )

  const { setEditorRef } = useProjectContext()
  const { toggleMark } = useMarkButton()
  const { toggleBlock } = useBlockButton()
  const { handleCopy, handlePaste } = useCopyPaste()
  const { marks } = useMarks()
  const { lists: listTypes, listItem: listItemType } = useLists()

  const markButtonHotkeys = {
    'mod+b': marks.bold,
    'mod+i': marks.italic,
    'mod+u': marks.underline,
    'mod+`': marks.code,
  }
  const blockButtonHotkeys = {
    'mod+shift+8': listTypes.numberedList,
    'mod+shift+9': listTypes.bulletedList,
  }
  const tab = "  " // 2 spaces

  useEffect(() => {
    setEditorRef(editor)

    return () => {
      setEditorRef(null)
    }
  }, [setEditorRef])

  /**
   * Custom behaviour
   */
  const { deleteBackward } = editor

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
          <ol
            {...attributes}
            className="list-decimal list-inside"
          >
            {children}
          </ol>
        )
      case listTypes.bulletedList:
        return (
          <ul
            {...attributes}
            className="list-disc list-inside"
          >
            {children}
          </ul>
        )
      case listItemType:
        return (
          <li {...attributes}>{children}</li>
        )
      default:
        return (
          <p {...attributes} style={{ margin: '0', padding: '0' }}>
            {children}
          </p>
        )
    }
  }

  const Leaf = props => {
    let { attributes, children, leaf } = props
    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.code) children = <code style={{ color: 'grey' }}>{children}</code>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>
    return (
      <span
        // The following is a workaround for a Chromium bug where,
        // if you have an inline at the end of a block,
        // clicking the end of a block puts the cursor inside the inline
        // instead of inside the final {text: ''} node
        // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
        style={{ paddingLeft: leaf.text === '' ? '0.1px' : 'null' }}
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
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Tab":
        event.preventDefault()
        Transforms.insertText(editor, tab)
        break
      default:
        for (let hotkey in markButtonHotkeys) {
          if (isHotkey(hotkey, event)) {
            event.preventDefault()
            toggleMark(editor, markButtonHotkeys[hotkey])
            return
          }
        }
        for (let hotkey in blockButtonHotkeys) {
          if (isHotkey(hotkey, event)) {
            event.preventDefault()
            toggleBlock(editor, blockButtonHotkeys[hotkey])
            return
          }
        }
    }
  }

  return (
    <div className="editor border-none bg-transparent h-full" >
      <Slate editor={editor} initialValue={initialValue}
        onChange={value => {
          const isAstChange = editor.operations.some(op => 'set_selection' !== op.type)
          if (isAstChange) {
            const content = JSON.stringify(value)
            localStorage.setItem('content', content)
          }
        }}
      >
        <div className="flex flex-col h-full">
          <Toolbar />
          <Editable
            className="overflow-x-hidden outline-none p-1 w-full h-full color-black bg-white dark:bg-mybgsec"
            style={{ tabSize: "2" }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={'Write here...'}
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
