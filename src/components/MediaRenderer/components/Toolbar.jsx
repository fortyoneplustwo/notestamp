import React from 'react'
import { cx, css } from '@emotion/css'

export const WithToolbar = ({ children, className, ...props }) => {
  return (
    <div
      className={cx(
        className,
        css`
          display: flex;
          flex-direction: column;
          height: 100%;
        `
      )}
      {...props}
    >
      {children}
    </div>
  )
} 

export const Toolbar = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={cx(
        "bg-[#f9f8fa]",
        "dark:border-[#3f3f46]",
        "dark:bg-mybgter",
        className,
        css`
         display: flex;
         padding: 10px;
         border-bottom: 1px solid lightgray;
        `
      )}
    >
      {children}
    </div>
  )
}

