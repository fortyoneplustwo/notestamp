import { AppBarButton } from "@/components/Button/Button"

const NavItem = (props) => {
  const { type, icon, onClick, children } = props

  return (
    <AppBarButton 
      variant="outline"
      size="xs"
      data-tour-id={type === "recorder" ? "sound-recorder-btn" : ""}
      onClick={() => onClick(children, type)}
    >
      { icon }
      { children }
    </AppBarButton>
  )
}

export default NavItem
