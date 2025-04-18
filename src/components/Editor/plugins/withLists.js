import { Transforms, Editor, Element } from "slate"

export const useLists = () => {
  const lists = {
    bulletedList: "bulleted-list",
    numberedList: "numbered-list",
  }

  const listItem = "list-item"
  return { lists, listItem }
}

export const withLists = editor => {
  editor.toggleList = (isActive, type) => {
    const { lists, listItem } = useLists()

    if (!Object.values(lists).includes(type)) throw Error("Invalid list type")

    Editor.withoutNormalizing(editor, () => {
      Transforms.unwrapNodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          Object.values(lists).includes(n.type),
        split: true,
      })
      const newProperties = {
        type: isActive ? "paragraph" : listItem,
      }
      Transforms.setNodes(editor, newProperties, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type !== editor.stampedElementType,
      })

      if (!isActive) {
        const block = { type: type, children: [] }
        Transforms.wrapNodes(editor, block, {
          match: n =>
            !Editor.isEditor(n) && Element.isElement(n) && n.type === listItem,
        })
      }
    })
  }

  return editor
}
