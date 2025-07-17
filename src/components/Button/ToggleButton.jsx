import { useState } from "react"
import { Icon } from "../Editor/components/Toolbar"

const ToggleButton = ({ icon = null, children, onClick = null, ...props }) => {
  const [isActive, setIsActive] = useState(false)

  const handleClick = () => {
    setIsActive(prev => !prev)
    onClick()
  }

  return (
    <button
      className={`${isActive && "text-[orangered] border-[orangered]"} flex bg-transparent border border-[#D3D3D3] hover:bg-[#D3D3D3] rounded cursor-pointer text-sm`}
      onClick={handleClick}
      {...props}
    >
      <span
        className={`$ flex-grow h-full flex items-center justify-center px-1`}
      >
        {icon && <Icon>{icon}</Icon>}
        {children}
      </span>
    </button>
  )
}

export default ToggleButton
