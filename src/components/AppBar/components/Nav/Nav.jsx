import NavItem from "./components/NavItem"

const Nav = ({ items, onClick }) => {
  return (
    <nav className="flex items-center">
      <ul className="flex gap-4">
        {items.map((item, index) => {
          return (
            <NavItem key={index} onClick={onClick} {...item}>
              {item.label}
            </NavItem>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
