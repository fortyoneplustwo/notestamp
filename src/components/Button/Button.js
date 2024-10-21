import { Icon } from "../Editor/components/Toolbar"

const Button = ({ icon=null, children, onClick=null, ...props }) => {
  return (
    <button className="flex bg-transparent text-black border border-[#D3D3D3] hover:bg-[#D3D3D3] rounded cursor-pointer text-sm" 
      onClick={onClick}
      {...props}
    >
      <span
        className="flex-grow h-full flex items-center justify-center px-1"
      >
        {icon && <Icon>{ icon }</Icon>}
        <span className=""> { children }</span>
      </span>
    </button>
  )
}

export default Button
