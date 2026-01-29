import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"

export const Pagination = (
  { hasNextPage, fetchNextPage, isFetchingNextPage, ref }
) => {
  if (!hasNextPage) return null
  return (
    <div
      ref={ref}
      className="border-t flex items-center justify-center h-24 text-center"
    >
      <Button
        variant="outline"
        onClick={fetchNextPage}
        size="sm"
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage && <Loader className="animate-spin" />}
        Load more
      </Button>
    </div>
  )
}
