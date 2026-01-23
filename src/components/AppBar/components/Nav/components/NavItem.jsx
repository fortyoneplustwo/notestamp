import { Button } from "@/components/ui/button"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

const NavItem = ({ icon, children, type }) => {
  const router = useRouter()
  const navigate = useNavigate()

  useEffect(() => {
    router.preloadRoute({ to: "/$mediaId", params: { mediaId: type } })
  }, [type, router])

  return (
    <Button
      variant="outline"
      size="xs"
      data-tour-id={type === "recorder" ? "sound-recorder-btn" : ""}
      onClick={() => navigate({ to: "/$mediaId", params: { mediaId: type } })}
    >
      {icon}
      {children}
    </Button>
  )
}

export default NavItem
