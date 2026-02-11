import NavItem from "./components/NavItem"
import iconsRegistry from "@/lib/registries/iconsRegistry"

const Nav = ({ items }) => {
  return (
    <nav className="flex items-center">
      <ul className="flex gap-4">
        {items.map(([moduleId, config], index) => {
          const icon = iconsRegistry.get(moduleId)
          return (
            <NavItem key={index} icon={icon} id={moduleId} {...config}>
              {config.label}
            </NavItem>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
