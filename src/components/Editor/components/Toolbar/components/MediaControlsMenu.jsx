import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ArrowBigUp } from "lucide-react"
import { Command } from "lucide-react"
import { Keyboard } from "lucide-react"
import { ActionButton } from "./ActionButton"

const Kbd = ({ hotkey }) => {
  let key = hotkey
  const className = "text-neutral-800 dark:text-gray-800"

  switch (hotkey) {
    case "mod":
      key = <Command className={className} />
      break
    case "shift":
      key = <ArrowBigUp className={className} />
      break
    default:
      break
  }

  return (
    <kbd
      className={`
        inline-flex justify-center p-1 items-center dark:bg-gray-300 border
        border-transparent font-mono text-xs/none dark:text-gray-800 rounded-xs 
        bg-neutral-200 text-neutral-800
      `}
    >
      {key}
    </kbd>
  )
}

export const MediaControlsMenu = ({ data, ...props }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton
          {...props}
          icon={Keyboard}
          aria-label="Media controls keyboard shortcuts"
          title="Keyboard shortcuts"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Media Controls</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.map(s => (
          <DropdownMenuItem
            variant="readonly"
            key={s.action}
            className="flex justify-between gap-5"
          >
            <span>{s.action}</span>
            <span className="inline-flex gap-1">
              {s.hotkey.map(key => (
                <Kbd key={key} hotkey={key} />
              ))}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
