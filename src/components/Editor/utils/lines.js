import { Editor, Node, Text } from "slate"

/**
 * Text[][] -> string
 * Converts an array of lines into a string
 */
export const linesToString = lines =>
  lines.reduce((acc, textList) => {
    return (
      acc + textList.reduce((acc, textNode) => acc + textNode.text, "") + "\n"
    )
  }, "")

/**
 * Editor, Node -> Text[][]
 * Returns an array of where each item represents
 * the text nodes of a single line within the node
 */
export const getLines = (editor, node) => {
  // Base case
  if (!Editor.hasBlocks(editor, node)) {
    if (Text.isTextList(node.children)) {
      return [node.children]
    }
    const textChildren = []
    const textNodes = Node.texts(node)
    for (const [textNode] of textNodes) textChildren.push(textNode)
    return [textChildren]
  }
  // Recursive step
  return node.children.flatMap(block => getLines(editor, block))
}
