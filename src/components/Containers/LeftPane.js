const LeftPane = ({ children }) => (
  <div className='grid grid-row-1 pl-2 pr-1 py-2 overflow-auto'>
    <div className="bg-white row-span-1 border border-solid rounded-md overflow-hidden">
      { children }
    </div>
  </div>
)

export default LeftPane
