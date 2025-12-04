import NavItem from "./components/NavItem"

const Nav = ({ items }) => {
  return (
    <nav className="flex items-center">
      <ul className="flex gap-4">
        {items.map((item, index) => {
          return (
            <NavItem key={index} {...item}>
              {item.label}
            </NavItem>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
