import Nav from "./components/Nav/Nav"
import Logo from "./components/Logo/Logo"
import AppToolbar from "./components/AppToolbar/AppToolbar"
import ProfileSettings from "./components/ProfileSettings/ProfileSettings"

const AppBar = ({ 
  navItems,
  onNavItemClick,
  showToolbar,
  onCloseProject,
  selectedProjectTitle,
}) => {
  return (
    <div className="flex w-full">
      <Logo />
      <span className="flex items-center" >
        {showToolbar ? (
          <AppToolbar
            onClose={onCloseProject}
            title={selectedProjectTitle}
          />
        ) : (
          <Nav items={navItems} onClick={onNavItemClick}/>
        )}
      </span>
      <ProfileSettings />
    </div>
  )
}

export default AppBar
