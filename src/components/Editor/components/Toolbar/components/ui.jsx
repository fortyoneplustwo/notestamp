import { css, cx } from "@emotion/css"
import React from "react"

export const Menu = ({ ref, className, ...props }) => (
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
          margin-left: 25px;
        }
      `
    )}
  />
)

export const Icon = ({ ref, className, ...props }) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      "material-icons",
      className,
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
    )}
  />
)

export const Button = ({ ref, className, active, reversed, ...props }) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        cursor: pointer;
        color: ${reversed
          ? active
            ? "orangered"
            : "#aaa"
          : active
            ? "orangered"
            : "#aaa"};
      `
    )}
  />
)
