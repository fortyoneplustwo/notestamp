import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ModalLayout from "../ModalLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchDuplicate } from "@/lib/fetch/api-read"
import { useDebounce } from "@uidotdev/usehooks"
import { useEffect, useMemo, useRef, useState } from "react"
import { Loader } from "lucide-react"

const SaveModal = ({ metadata = null, onSubmit, onClose }) => {
  const [inputValue, setInputValue] = useState(metadata?.title)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState("")

  const debouncedInput = useDebounce(inputValue, 300)
  const queryClient = useQueryClient()
  const inputRef = useRef()

  const checkForDuplicateQueryOptions = useMemo(
    () => ({
      queryFn: async () => await fetchDuplicate({ projectId: debouncedInput }),
      queryKey: ["exists", debouncedInput],
      enabled: !!debouncedInput,
      staleTime: Infinity,
      gcTime: 0,
    }),
    [debouncedInput]
  )

  useQuery(checkForDuplicateQueryOptions)

  useEffect(() => {
    if (debouncedInput) {
      queryClient.prefetchQuery(checkForDuplicateQueryOptions)
    }
  }, [debouncedInput, checkForDuplicateQueryOptions, queryClient])

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      setErrMsg("")
      setIsLoading(true)
      const data = await queryClient.ensureQueryData({
        queryFn: async () =>
          await fetchDuplicate({ projectId: event.target.filename.value }),
        queryKey: ["exists", event.target.filename.value],
        staleTime: Infinity,
        gcTime: 0,
      })
      if (data?.isDuplicate) {
        setErrMsg("A file with this name already exists. Pick a different one.")
        setTimeout(() => inputRef.current?.focus(), 0)
        return
      }
      onSubmit(event.target.filename.value)
      onClose()
    } catch (err) {
      setErrMsg(err.message)
      setTimeout(() => inputRef.current?.focus(), 0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Save project</DialogTitle>
        <DialogDescription>Name your project</DialogDescription>
      </DialogHeader>
      <form
        id="saveForm"
        onSubmit={handleSubmit}
        className="flex flex-col gap-1"
      >
        <Input
          ref={inputRef}
          type="text"
          name="filename"
          defaultValue={metadata ? metadata.title : ""}
          disabled={isLoading}
          onChange={e => setInputValue(e.target.value)}
          autoFocus
          required
        />
        {errMsg && <span className="text-xs text-red-500">{errMsg}</span>}
      </form>
      <DialogFooter>
        <Button
          disabled={isLoading}
          form="saveForm"
          type="submit"
          className="float-right"
        >
          {isLoading && <Loader className="animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </ModalLayout>
  )
}

export default SaveModal
