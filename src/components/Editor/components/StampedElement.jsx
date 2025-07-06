import { css } from "@emotion/css"
import React from "react"

export const StampedElement = ({ onClick, attributes, element, children }) => {
  return (
    <span
      {...attributes}
      className={css`
        display: inline-flex;
        flex-direction: row;
        overflow-y: none;
        & + & {
          margin-top: 0;
        }
      `}
    >
      <span
        onClick={() => onClick(element.label, element.value)}
        contentEditable={false}
        className={css`
          display: inline-block;
          height: 100%;
          margin-right: 0.75em;
          color: red;
        `}
      >
        <button
          className={css`
            background-color: transparent;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            color: red;
            user-select: none;
            padding: 0 2px 0 2px;
            &focus: {
              outline: none;
            }
          `}
        >
          {element.label}
        </button>
      </span>
      <span
        contentEditable={true}
        suppressContentEditableWarning
        className={css`
          flex: 1;
          width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
          &:focus {
            outline: none;
          }
        `}
      >
        {children}
      </span>
    </span>
  )
}
