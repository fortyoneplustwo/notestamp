import React, { useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useImperativeHandle, useState } from "react"
import { cn } from "@/lib/utils"

export const DataTable = ({
  ref,
  columns,
  data,
  onRowClick,
  columnFilters,
  sorting,
  onColumnFiltersChange,
  onSortingChange,
}) => {
  const [, setViewportWidth] = useState(window.innerWidth)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: onColumnFiltersChange,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  })

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useImperativeHandle(ref, () => {
    return {
      getFilterValue(column) {
        return table.getColumn(column)?.getFilterValue() ?? ""
      },
      async filterProjects(column, value) {
        table.getColumn(column)?.setFilterValue(value)
      },
    }
  })

  return (
    <Table isHeaderSticky={true}>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              return (
                <TableHead
                  key={header.id}
                  className="sticky top-0 z-10 bg-background dark:bg-mybgsec shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1px_0_0_#27272a]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <TableRow
              className={cn({
                // "bg-red-300/50": row.original.status === "error",
                // "bg-yellow-200/50": row.original.status === "pending"
              })}
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => onRowClick(row.getValue("title"))}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable
