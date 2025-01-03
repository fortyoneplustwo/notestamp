import React from 'react'
import { cx, css } from '@emotion/css'

export const Menu = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={cx(
        className,
        css`
          & > * {
            display: inline-block;
          }

          & > * + * {
            margin-left: 15px;
          }
        `
      )}
    />
  )
)

export const Icon = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        'material-icons',
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `
      )}
    />
  )
)

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'orangered'
              : '#aaa'
            : active
            ? 'orangered'
            : '#ccc'};
        `
      )}
    />
  )
)

export const Toolbar = React.forwardRef(
  (
    { className, ...props },
    ref,
  ) => (
    <Menu
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          position: relative;
          /* padding: 1px 1px 17px 1px; */
          // padding: 1px;
          width: 100%;
          /* margin: 0 -20px; */
          /* border-bottom: 2px solid #eee; */
          /* margin-bottom: 20px; */
        `
      )}
    />
  )
)
