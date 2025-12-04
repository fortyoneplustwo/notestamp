import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { useNavigate } from "@tanstack/react-router"

const NavItem = ({ icon, children, ...props }) => {
  const navigate = useNavigate()
  const { cwd } = useAppContext()

  const handleOpenNewProject = () => {
    // set new (empty) project context from here
    navigate({
      from: cwd ? '/local/workspace' : '/',
      to: `${props.type}`
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
