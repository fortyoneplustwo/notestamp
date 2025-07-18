import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

export const Dropzone = ({ icon: Icon, message, accept, onAccept }) => {
  const [isDragEnter, setIsDragEnter] = useState(false)

  const onDragEnter = () => setIsDragEnter(true)
  const onDragLeave = () => setIsDragEnter(false)
  const onDrop = acceptedFiles => {
    setIsDragEnter(false)
    acceptedFiles.length > 0 && onAccept(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    accept,
    onDrop,
    onDragEnter,
    onDragLeave,
    noClick: true,
  })

  return (
    <Card
      data-testid="dropzone"
      {...getRootProps()}
      className={`flex items-center justify-center p-15 ${isDragEnter && "border-[orangered]"}`}
    >
      <input {...getInputProps()} />
      <CardContent className={`flex flex-col items-center gap-5 text-xs `}>
        <Icon size={36} strokeWidth={1} />
        <p className="flex flex-col items-center text-[grey]">
          <span>{message}</span>
          <span>or</span>
        </p>
        <Button size="xs" onClick={open}>
          Browse file
        </Button>
      </CardContent>
    </Card>
  )
}
