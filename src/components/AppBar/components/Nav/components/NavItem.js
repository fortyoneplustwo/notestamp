const NavItem = (props) => {
  const { type, onClick, children } = props

  return (
    <button className="text-sm bg-transparent text-black cursor-pointer hover:underline "
      onClick={() => { onClick(children, type) }}
    >
      { children }
    </button>
  )
}

export default NavItem
