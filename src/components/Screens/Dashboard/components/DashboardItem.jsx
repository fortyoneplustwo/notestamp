import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

const DashboardItem = props => {
  const { id, onOpen, onDelete } = props

  return (
    <li className="w-full odd:bg-slate-200 dark:even:bg-mybgter dark:odd:bg-transparent">
      <div
        onClick={() => {
          onOpen(id)
        }}
        className="p-2 bg-transparent"
      >
        {id}
        <Button
          size="xs"
          variant="ghost"
          title="delete"
          className="float-right"
          onClick={e => {
            e.stopPropagation()
            onDelete(id)
          }}
        >
          <Trash size={16} />
        </Button>
      </div>
    </li>
  )
}

export default DashboardItem
