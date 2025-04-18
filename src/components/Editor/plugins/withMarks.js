import { Editor } from "slate"

export const useMarks = () => {
  const marks = {
    bold: "bold",
    italic: "italic",
    underline: "underline",
    code: "code",
  }
  return { marks }
}

export const withMarks = editor => {
  const { insertBreak } = editor

  editor.toggleMark = (isActive, format) => {
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  editor.insertBreak = () => {
    const marks = Editor.marks(editor)
    insertBreak()
    for (const mark in marks) {
      if (marks[mark]) Editor.addMark(editor, mark, true)
    }
  }

  return editor
}
