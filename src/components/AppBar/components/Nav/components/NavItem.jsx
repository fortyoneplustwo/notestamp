import { AppBarButton } from "@/components/Button/Button"
import { FileText, Headphones, Mic, TvMinimalPlay } from "lucide-react"

const NavItem = (props) => {
  const { type, onClick, children } = props

  return (
    <AppBarButton 
      variant="outline"
      size="xs"
      onClick={() => onClick(children, type)}
    >
      {type === "youtube" && <TvMinimalPlay size={16} />}
      {type === "audio" && <Headphones size={16} />}
      {type === "recorder" && <Mic size={16} />}
      {type === "pdf" && <FileText size={16} />}
      { children }
    </AppBarButton>
  )

}

export default NavItem
