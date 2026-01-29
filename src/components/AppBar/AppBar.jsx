import Nav from "./components/Nav/Nav"
import Logo from "./components/Logo/Logo"
import AppToolbar from "./components/AppToolbar/AppToolbar"
import ProfileSettings from "./components/ProfileSettings/ProfileSettings"
import { useParams } from "@tanstack/react-router"
import { defaultMediaConfig } from "@/config"
import { useMemo } from "react"

const AppBar = ({ navItems }) => {
  const { mediaId } = useParams({ strict: false })
  const isValidMediaId = useMemo(
    () => defaultMediaConfig.find(m => m.type === mediaId),
    [mediaId]
  )

  return (
    <div className="flex w-full gap-4">
      <Logo />
      <span className="flex items-center grow">
        {isValidMediaId ? <AppToolbar /> : <Nav items={navItems} />}
      </span>
      <ProfileSettings />
    </div>
  )
}

export default AppBar
