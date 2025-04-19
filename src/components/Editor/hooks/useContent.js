import { Editor, Node, Transforms } from "slate"

export const useContent = () => {
  const getContent = editor => {
    return structuredClone(editor.children)
  }

  const setContent = (editor, contentString) => {
    try {
      const children = JSON.parse(contentString)

      if (!Node.isNodeList(children)) {
        throw Error("Type must be Node[]")
      }

      Editor.withoutNormalizing(editor, () => {
        while (editor.children.length > 0) {
          Transforms.removeNodes(editor, {
            at: [0],
          })
        }

        Transforms.insertNodes(editor, children, {
          at: [0],
        })
      })
    } catch (error) {
      console.error(`Invalid content:\n${error}`)
    }
  }

  return { getContent, setContent }
}
