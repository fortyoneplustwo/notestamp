import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ACTIONS, EVENTS, STATUS } from "react-joyride"

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

  const steps = [
    {
      target: 'span[data-tour-id="file-sync-switch"]',
      title: <strong>Toggle File Sync</strong>,
      content:
        "Link a folder on your device to load existing projects and save new ones.",
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'div[data-tour-id="dashboard"]',
      title: <strong>Dashboard</strong>,
      content:
        "Your projects will show up here. It's empty for now, so let's create one!",
      placement: "right-start",
      disableBeacon: true,
    },
    {
      target: 'button[data-tour-id="sound-recorder-btn"]',
      title: <strong>Start a New Project</strong>,
      content:
        "Let's try the Sound Recorder. Allow microphone access if asked.",
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'button[data-tour-id="record-btn"]',
      content: "Press Record to start capturing audio.",
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'div[data-tour-id="editor"]',
      title: <strong>Take Notes</strong>,
      content:
        "Type a few notes. Notice how a timestamp appears at the start of each line.",
      placement: "left-start",
      disableBeacon: true,
    },
    {
      target: 'button[data-tour-id="stop-btn"]',
      content: "Press Stop to finish recording.",
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'div[data-tour-id="editor"]',
      title: <strong>Your Notes Are Synced!</strong>,
      content: "Click a timestamp to jump to that moment in the recording.",
      placement: "left-start",
      disableBeacon: true,
    },
    {
      target: 'span[data-tour-id="toolbar"]',
      title: <strong>Toolbar</strong>,
      content: "Save or close your project when you're done.",
      disableBeacon: true,
      locale: { close: "Exit Tour" },
    },
  ]

  return { run, stepIndex, steps, handleOnBeginTour, handleJoyrideCallback }
}

export function Tooltip({
  children,
  position = "top",
  arrow = true,
  className,
  ...props
}) {
  const positionClasses = {
    top: "mb-2",
    right: "ml-2",
    bottom: "mt-2",
    left: "mr-2",
  }

  const arrowClasses = {
    top: "after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-current after:border-x-transparent after:border-b-0",
    right:
      "after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-current after:border-y-transparent after:border-l-0",
    bottom:
      "after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-current after:border-x-transparent after:border-t-0",
    left: "after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-current after:border-y-transparent after:border-r-0",
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className={cn(
          "bg-primary text-primary-foreground text-xs rounded-md px-2.5 py-1.5 max-w-xs z-50 shadow-sm",
          positionClasses[position],
          arrow &&
            "after:absolute after:content-[''] after:border-4 after:border-solid after:text-primary",
          arrow && arrowClasses[position],
          className
        )}
        role="tooltip"
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export const TourTooltip = props => {
  const { primaryProps, closeProps, tooltipProps, step, isLastStep } = props

  return (
    <Tooltip {...tooltipProps} arrow={false}>
      <div className="flex flex-col gap-2">
        {step.title && <h2 className="w-full text-center">{step.title}</h2>}
        {step.content}
        {!step.hideFooter && (
          <div className="flex justify-end">
            {!isLastStep ? (
              <Button {...primaryProps} variant="secondary" size="xs">
                Continue
              </Button>
            ) : (
              <Button {...closeProps} variant="destructive" size="xs">
                End tour
              </Button>
            )}
          </div>
        )}
      </div>
    </Tooltip>
  )
}
