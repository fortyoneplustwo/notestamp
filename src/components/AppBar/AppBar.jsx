import Nav from "./components/Nav/Nav"
import Logo from "./components/Logo/Logo"
import AppToolbar from "./components/AppToolbar/AppToolbar"
import ProfileSettings from "./components/ProfileSettings/ProfileSettings"
import { useParams } from "@tanstack/react-router"
import { configs as mediaModulesConfig } from "virtual:media/config"

const AppBar = () => {
  const { mediaId } = useParams({ strict: false })

  return (
    <div className="flex w-full gap-4">
      <Logo />
      <span className="flex items-center grow">
        {mediaModulesConfig[mediaId] ? (
          <AppToolbar />
        ) : (
          <Nav items={Object.entries(mediaModulesConfig)} />
        )}
      </span>
      <ProfileSettings />
    </div>
  )
}

export default AppBar
