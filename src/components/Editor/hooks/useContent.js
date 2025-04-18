import { Editor, Transforms } from "slate"

export const useContent = () => {
  const getContent = editor => {
    return structuredClone(editor.children)
  }

  const setContent = (editor, contentString) => {
    try {
      const children = JSON.parse(contentString)
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      })
      Transforms.unwrapNodes(editor)
      Transforms.removeNodes(editor)
      Transforms.insertNodes(editor, children)
    } catch (error) {
      console.error(`Invalid editor content:\n${error}`)
    }
  }

  return { getContent, setContent }
}
