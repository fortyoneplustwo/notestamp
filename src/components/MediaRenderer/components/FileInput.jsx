import { Button } from "@/components/ui/button"
import { useRef } from "react"

export const FileInput = ({ filename, onOpen }) => {
  const hiddenInputRef = useRef(null)
  return (
    <span
      className="bg-background px-3 py-0 rounded-md min-w-20 w-xs shadow-xs text-foreground truncate whitespace-nowrap overflow-hidden text-xs"
      onClick={() => hiddenInputRef.current?.click()}
    >
      <input
        ref={hiddenInputRef}
        className="hidden"
        type="file"
        accept="audio/*, video/webm"
        onChange={e => onOpen(e.target.files[0])}
      />
      <Button
        variant="primary"
        size="xs"
        className="outline-none p-0 mr-3 font-bold"
      >
        Choose file
      </Button>
      {filename}
    </span>
  )
}
