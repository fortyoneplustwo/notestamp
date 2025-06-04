import { Loader } from "lucide-react"

const Loading = () => (
  <>
    <div className="flex flex-col gap-1 items-center justify-center h-full w-full p-[20%]">
      <Loader size={24} className="animate-spin" />
    </div>
  </>
)

export default Loading
