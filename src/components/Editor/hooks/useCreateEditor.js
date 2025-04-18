import { useState } from "react"
import { createEditor } from "slate"
import { withHistory } from "slate-history"
import { withReact } from "slate-react"

export const useCreateEditor = () => {
  const [editor] = useState(() => withReact(withHistory(createEditor())))
  return { editor }
}
