import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"

const NavItem = ({ icon, children, ...props }) => {
  return (
    <Link to="/$mediaId" params={{ mediaId: props.type }} preload="render">
      <Button
        variant="outline"
        size="xs"
        data-tour-id={props.type === "recorder" ? "sound-recorder-btn" : ""}
      >
        {icon}
        {children}
      </Button>
    </Link>
  )
}

export default NavItem
