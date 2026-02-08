import { Button } from "@/components/ui/button"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

const NavItem = ({ icon, children, id }) => {
  const router = useRouter()
  const navigate = useNavigate()

  useEffect(() => {
    router.preloadRoute({ to: "/$mediaId", params: { mediaId: id } })
  }, [id, router])

  return (
    <Button
      variant="outline"
      size="xs"
      data-tour-id={id === "recorder" ? "sound-recorder-btn" : ""}
      onClick={() =>
        navigate({ to: "/$mediaId", params: { mediaId: id } })
      }
    >
      {icon}
      {children}
    </Button>
  )
}

export default NavItem
