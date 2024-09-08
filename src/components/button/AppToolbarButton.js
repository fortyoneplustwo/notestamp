const AppToolbarButton = ({ svgIcon=null, label, onClick=null }) => {
  return (
    <button className="flex bg-transparent text-black border border-[#D3D3D3] hover:bg-[#D3D3D3] rounded cursor-pointer text-sm" 
      onClick={onClick}
    >
      <span
        className="flex-grow h-full flex items-center justify-center px-1"
      >
        {svgIcon && (
        <span className="w-4 mr-0.5 align-center">
          { svgIcon }
        </span>
        )}
        { label }
      </span>
    </button>
  )
}

export default AppToolbarButton
