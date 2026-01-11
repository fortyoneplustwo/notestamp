import { Frown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Error = ({ errorMsg, onRetry, onExit }) => (
  <>
    <div
      data-testid="error-screen"
      className="flex flex-col gap-1 items-center justify-center h-full w-full"
    >
      <Frown size={112} className="mb-5 text-[orangered]" />
      <h1 className="font-semibold text-xl">Something went wrong!</h1>
      {errorMsg && <h2 className="">{errorMsg}</h2>}
      <span className="flex gap-3 mt-10">
        <Button onClick={onRetry}>Retry</Button>
        <Button variant="secondary" onClick={onExit}>
          Exit
        </Button>
      </span>
    </div>
  </>
)
