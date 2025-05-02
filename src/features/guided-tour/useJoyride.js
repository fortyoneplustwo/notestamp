import { useState } from "react"
import { STATUS } from "react-joyride"
import { ACTIONS } from "react-joyride"
import { EVENTS } from "react-joyride"
import { steps } from "./config"

export const useJoyride = () => {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const handleOnBeginTour = () => {
    setRun(true)
  }

  const handleJoyrideCallback = data => {
    const { action, index, status, type } = data

    if (stepIndex === 0 && type === EVENTS.STEP_BEFORE) {
      const leftPane = document.querySelector('div[data-tour-id="left-pane"]')
      if (leftPane) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (m.addedNodes.length > 0) {
              observer.disconnect()
              setStepIndex(index + 1)
            }
          }
        }).observe(leftPane, { childList: true })
      }
    } else if (stepIndex === 2) {
      const leftPane = document.querySelector('div[data-tour-id="left-pane"]')
      if (leftPane) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (m.addedNodes.length > 0) run && setRun(false)
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                const recordButton = node.querySelector(
                  'button[data-tour-id="record-btn"]'
                )
                if (recordButton) {
                  setTimeout(() => {
                    setStepIndex(index + 1)
                    setRun(true)
                    observer.disconnect()
                  }, 50) // Timeout makes the transition less jarring
                }
              }
            }
          }
        }).observe(leftPane, { childList: true, subtree: true })
      }
    } else if (stepIndex === 3) {
      const stopButton = document.querySelector(
        'button[data-tour-id="stop-btn"]'
      )
      if (stopButton) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (
              m.type === "attributes" &&
              m.attributeName === "disabled" &&
              stopButton.getAttribute("disabled") === null
            ) {
              setStepIndex(index + 1)
              observer.disconnect()
            }
          }
        }).observe(stopButton, {
          attributes: true,
          attributeFilter: ["disabled"],
        })
      }
    } else if (stepIndex === 5) {
      const stopButton = document.querySelector(
        'button[data-tour-id="stop-btn"]'
      )
      if (stopButton) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (
              m.type === "attributes" &&
              m.attributeName === "disabled" &&
              stopButton.getAttribute("disabled") !== null
            ) {
              setStepIndex(index + 1)
              observer.disconnect()
            }
          }
        }).observe(stopButton, {
          attributes: true,
          attributeFilter: ["disabled"],
        })
      }
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      setStepIndex(0)
    }
  }

  return { run, steps, stepIndex, handleOnBeginTour, handleJoyrideCallback }
}
