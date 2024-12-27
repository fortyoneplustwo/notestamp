import React from "react"

const RightPane = ({ children }) => (
    <div className="grid grid-row-1 pl-1 pr-2 py-2 overflow-hidden">
      <div className="dark:bg-mybgprim dark:border-[#3f3f46] row-span-1 h-100% border border-solid rounded-md overflow-hidden">
        { children }
      </div>
    </div>
)

export default RightPane
