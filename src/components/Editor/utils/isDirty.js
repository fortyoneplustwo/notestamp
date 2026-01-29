import { Element, Text } from "slate"

export const isDirty = editor => {
  if (editor.children.length === 1) {
    const onlyChild = editor.children[0]
    if (
      Element.isElement(onlyChild) &&
      onlyChild.type === "paragraph" &&
      onlyChild.children.length === 0
    ) {
      const onlyLeaf = onlyChild.children[0]
      if (Text.isText(onlyLeaf) && onlyLeaf.text === "") {
        return false
      }
    }
  }
  return true
}
