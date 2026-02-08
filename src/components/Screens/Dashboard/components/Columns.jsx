import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { useState } from "react"
import { configs as mediaModulesConfig } from "virtual:media/config"
import { LoaderCircle, CircleAlert } from "lucide-react"
import iconRegistry from "@/lib/registries/iconsRegistry"

export const columns = [
  {
    accessorKey: "title",
    header: () => {
      const colWidth = window.innerWidth / 4
      return <div style={{ width: `${colWidth}px` }}>Project</div>
    },
    cell: ({ row }) => {
      const colWidth = window.innerWidth / 4
      return (
        <div
          style={{ maxWidth: `${colWidth}px` }}
          className="flex items-center gap-2 h-full truncate overflow-hidden whitespace-nowrap"
        >
          {row.original?.status && (
            <span className="h-full text-base">
              {row.original?.status === "error" && (
                <CircleAlert size={12} className="text-red-500 h-full" />
              )}
              {row.original?.status === "pending" && (
                <LoaderCircle
                  size={12}
                  className="animate-spin text-zinc-500 h-full"
                />
              )}
            </span>
          )}
          <span>{row.getValue("title")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const [filterByMedia, setFilterByMedia] = useState(null)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Media
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={!filterByMedia}
              onCheckedChange={() => {
                setFilterByMedia(null)
                column.setFilterValue(null)
              }}
            >
              All
            </DropdownMenuCheckboxItem>
            {Object.entries(mediaModulesConfig)
              .filter(([moduleId]) => moduleId !== "recorder")
              .map(([moduleId, { label }]) => (
                <DropdownMenuCheckboxItem
                  key={moduleId}
                  checked={filterByMedia === moduleId}
                  onCheckedChange={() => {
                    column.setFilterValue(moduleId)
                    setFilterByMedia(moduleId)
                  }}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        {iconRegistry.get(row.original.type)}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId)
      return filterValue ? cellValue === filterValue : true
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <div className="flex flex-row justify-end">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Modified
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {row.getValue("lastModified").toString().split("T")[0]}
      </div>
    ),
  },
]
