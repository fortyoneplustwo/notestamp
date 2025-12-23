import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"

const NavItem = ({ icon, children, ...props }) => {
  const navigate = useNavigate()

  const handleOpenNewProject = () => {
    navigate({
      from: "/",
      to: `${props.type}`,
    })
  }
  return (
    <Button
      variant="outline"
      size="xs"
      data-tour-id={props.type === "recorder" ? "sound-recorder-btn" : ""}
      onClick={handleOpenNewProject}
    >
      {icon}
      {children}
    </Button>
  )
}

export default NavItem
