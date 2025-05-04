import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState } from "react";
import { defaultMediaConfig as mediaComponents } from "@/config";

export const columns = [
  {
    accessorKey: "title",
    header: () => {
      const colWidth = window.innerWidth / 4
      return (
        <div style={{ width: `${colWidth}px`}}>
          Project
        </div>
      )
    },
    cell: ({ row }) => {
      const colWidth = window.innerWidth / 4
      return (
        <div 
          style={{ maxWidth: `${colWidth}px`}}
          className="truncate overflow-hidden whitespace-nowrap"
        >
          {row.getValue("title")}
        </div>
      )
    }
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
            {mediaComponents
              .filter(media => media.type !== "recorder")
              .map(media => (
                <DropdownMenuCheckboxItem
                  key={media.type}
                  checked={filterByMedia === media.type}
                  onCheckedChange={() => {
                    column.setFilterValue(media.type)
                    setFilterByMedia(media.type)
                  }}
                >
                  {media.label}
                </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    cell: ({ row }) => 
      <div className="flex justify-center">
        {mediaComponents
          .find((media) => media.type === row.original.type)
          .icon
        }
      </div>,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId)
      return filterValue ? cellValue === filterValue : true
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => 
      <div className="flex flex-row justify-end">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Modified
          <ArrowUpDown />
        </Button>
      </div>,
    cell: ({ row }) =>
      <div className="text-right">
        {row.getValue("lastModified").toString().split("T")[0]}
      </div>,
  },
]
