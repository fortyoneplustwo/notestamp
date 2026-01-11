import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useAppContext } from "@/context/AppContext"
import { FileQuestionIcon } from "lucide-react"

export const NotFound = () => {
  const { user, cwd } = useAppContext()
  const navigate = useNavigate()
  return (
    <>
      <div
        data-testid="error-screen"
        className="flex flex-col gap-1 items-center justify-center h-full w-full"
      >
        <FileQuestionIcon size={112} className="mb-5 text-[orangered]" />
        <h1 className="font-semibold text-xl">404 Not Found</h1>
        <h2 className="">Are you lost?</h2>
        <span className="flex gap-3 mt-10">
          <Button
            onClick={() => {
              if (user || cwd) {
                return navigate({ to: "/dashboard" })
              }
              navigate({ to: "/" })
            }}
          >
            Go to homepage
          </Button>
        </span>
      </div>
    </>
  )
}
