import { Button } from "@/components/ui/button"

const NavItem = ({ icon, children, onClick, ...props }) => {
  return (
    <Button
      variant="outline"
      size="xs"
      data-tour-id={props.type === "recorder" ? "sound-recorder-btn" : ""}
      onClick={() => onClick({ ...props })}
    >
      {icon}
      {children}
    </Button>
  )
}

export default NavItem
