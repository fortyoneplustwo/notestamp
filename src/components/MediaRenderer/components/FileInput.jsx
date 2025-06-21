import { Button } from "@/components/ui/button"
import { useRef } from "react"

export const FileInput = ({ accept, filename, onChange }) => {
  const hiddenInputRef = useRef(null)
  return (
    <span
      data-testid="file-input"
      className="bg-background px-3 py-0 rounded-md min-w-20 w-xs shadow-xs text-foreground truncate whitespace-nowrap overflow-hidden text-xs"
      onClick={() => hiddenInputRef.current?.click()}
    >
      <input
        ref={hiddenInputRef}
        className="hidden"
        type="file"
        accept={accept}
        onChange={e => onChange(e.target.files[0])}
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
