import { useState } from "react"
import {
  Editor,
  Transforms,
  Element as SlateElement,
  Range,
  Path,
  Point,
} from "slate"
import { getLines, linesToString } from "../utils/lines"

export const useCopyPaste = () => {
  const [internalClipboard, setInternalClipboard] = useState([])

  const handleCopy = event => editor => {
    event?.preventDefault()
    const { selection } = editor
    if (selection) {
      const fragment = editor.getFragment()
      const copiedLines = fragment.flatMap(node => getLines(editor, node))
      const copiedString = linesToString(copiedLines)
      event.clipboardData.setData("text/plain", copiedString)
      setInternalClipboard(copiedLines)
    }
  }

  const handlePaste = event => editor => {
    event?.preventDefault()

    const { selection } = editor
    if (Range.isExpanded(selection)) editor.deleteFragment()

    const internalClipboardToString = linesToString(internalClipboard)
    const deviceClipboardData = event.clipboardData.getData("Text")
    if (internalClipboardToString !== deviceClipboardData) {
      Transforms.insertText(editor, deviceClipboardData.toString())
      return
    }

    let match = Editor.above(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n) &&
        n.type !== editor.stampedElementType,
    })
    if (!match) return
    const [closestNonStampedAncestor, closestNonStampedAncestorPath] = match

    match = Editor.above(editor, {
      match: n =>
        Editor.isBlock(editor, n) &&
        SlateElement.isElement(n) &&
        n.type === editor.stampedElementType,
    })
    let stampedBlock, stampedBlockPath
    if (match) [stampedBlock, stampedBlockPath] = match

    const [first, ...rest] = internalClipboard
    const nodesRest = rest.map(line => {
      return {
        type: closestNonStampedAncestor.type,
        children: !match ? line : [{ ...stampedBlock, children: line }],
      }
    })

    Transforms.insertNodes(editor, first)

    const isSelectionAtEndOfLine = Point.equals(
      editor.selection.anchor,
      Editor.end(
        editor,
        match ? stampedBlockPath : closestNonStampedAncestorPath
      )
    )
    if (!isSelectionAtEndOfLine && rest.length > 0) {
      Transforms.splitNodes(editor)
      if (match) {
        Transforms.moveNodes(editor, {
          at: Path.next(stampedBlockPath),
          to: Path.next(closestNonStampedAncestorPath),
        })
        Transforms.wrapNodes(
          editor,
          { type: closestNonStampedAncestor.type },
          { at: Path.next(closestNonStampedAncestorPath) }
        )
      }
    }

    let path = closestNonStampedAncestorPath
    for (let i = 0; i < nodesRest.length; i++) {
      const node = nodesRest[i]
      if (i === nodesRest.length - 1 && !isSelectionAtEndOfLine) {
        Transforms.insertNodes(editor, rest[i], {
          at: Editor.start(editor, Path.next(path)),
        })
      }
      Transforms.insertNodes(editor, node, { at: Path.next(path) })
      Transforms.setSelection(editor, {
        anchor: Editor.end(editor, Path.next(path)),
        focus: Editor.end(editor, Path.next(path)),
      })
      path = Path.next(path)
    }
  }

  return { handleCopy, handlePaste }
}
