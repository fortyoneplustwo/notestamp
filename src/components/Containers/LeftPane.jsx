const LeftPane = ({ children }) => (
  <div className='grid grid-row-1 pl-2 pr-1 py-2 overflow-hidden'>
    <div
      className="bg-white dark:bg-mybgsec row-span-1 border border-solid dark:border-[#3f3f46] border-[lightgray] rounded-md overflow-hidden"
      data-tour-id="left-pane"
    >
      {children}
    </div>
  </div>
)

export default LeftPane
