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
import { useAppContext } from "@/context/AppContext"
import { fetchDirHandle, fetchMetadata } from "@/lib/fetch/api-read"
import { useDebounce } from "@uidotdev/usehooks"
import { useEffect, useRef, useState } from "react"
import { Loader } from "lucide-react"

const SaveModal = ({ metadata = null, onSubmit, onClose }) => {
  const [inputValue, setInputValue] = useState(metadata?.title)
  const [submittedInput, setSubmittedInput] = useState("")
  const [errMsg, setErrMsg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasQueryFired, setHasQueryFired] = useState(false)

  const queryClient = useQueryClient()
  const debouncedInput = useDebounce(inputValue, 300)
  const { cwd } = useAppContext()
  const inputRef = useRef()

  const {
    data: exists,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryFn: async () =>
      cwd
        ? await fetchDirHandle({ id: submittedInput || debouncedInput, cwd })
        : await fetchMetadata({ projectId: debouncedInput }),
    queryKey: ["exists", submittedInput, debouncedInput, cwd],
    enabled: Boolean(debouncedInput || false),
    staleTime: Infinity,
    gcTime: 0,
  })

  useEffect(() => {
    console.log({
      hasQueryFired,
      isPending,
      isFetching,
      error,
      exists,
    })

    if (!hasQueryFired) return
    if (isFetching || isPending) return

    if (error || exists) {
      setIsSubmitting(false)
      setHasQueryFired(false)
      setErrMsg(
        error
          ? error.message
          : "A project with this title already exists. Pick a different one."
      )
      setTimeout(() => {
        // Timeout prevents the callback from being overriden by rerenders
        // by pushing to the end of the event queue
        inputRef.current?.focus()
      }, 0)
      return
    }

    onSubmit(submittedInput)
    onClose()
  }, [
    hasQueryFired,
    isFetching,
    isPending,
    error,
    exists,
    onSubmit,
    submittedInput,
    onClose,
  ])

  const handlePrefetchQuery = async e => {
    e.preventDefault()
    setErrMsg("")
    setIsSubmitting(true)
    setHasQueryFired(() => {
      const hasPrefetched = queryClient
        .getQueryCache()
        .find(["exists", e.target.filename.value, cwd])
      if (!hasPrefetched) {
        setSubmittedInput(e.target.filename.value)
      }
      return true
    })
  }

  return (
    <ModalLayout onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Save project</DialogTitle>
        <DialogDescription>Name your project</DialogDescription>
      </DialogHeader>
      <form
        id="saveForm"
        onSubmit={handlePrefetchQuery}
        className="flex flex-col gap-1"
      >
        <Input
          ref={inputRef}
          type="text"
          name="filename"
          defaultValue={metadata ? metadata.title : ""}
          disabled={isSubmitting}
          onChange={e => setInputValue(e.target.value)}
          autoFocus
          required
        />
        {errMsg && <span className="text-xs text-red-500">{errMsg}</span>}
      </form>
      <DialogFooter>
        <Button
          disabled={isSubmitting && isFetching}
          form="saveForm"
          type="submit"
          className="float-right"
        >
          {isSubmitting && isFetching && <Loader className="animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </ModalLayout>
  )
}

export default SaveModal
