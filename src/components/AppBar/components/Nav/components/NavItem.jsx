import { Button } from "@/components/ui/button"

const NavItem = props => {
  const { type, icon, onClick, children } = props

  return (
    <Button
      variant="outline"
      size="xs"
      data-tour-id={type === "recorder" ? "sound-recorder-btn" : ""}
      onClick={() => onClick(children, type)}
    >
      {icon}
      {children}
    </Button>
  )
}

export default NavItem
