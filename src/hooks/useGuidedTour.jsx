import { useState } from "react"
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride"

export const useJoyride = () => {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const handleOnBeginTour = () => {
    setRun(true)
  }

  const handleJoyrideCallback = data => {
    const { action, index, status, type } = data
    if (index === 0 && type === EVENTS.STEP_BEFORE) {
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
    } else if (index === 2) {
      const leftPane = document.querySelector('div[data-tour-id="left-pane"]')
      if (leftPane) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (m.addedNodes.length > 0) {
              setTimeout(() => {
                observer.disconnect()
                setStepIndex(index + 1)
              }, 50) // Need to wait for record button to render
            }
          }
        }).observe(leftPane, { childList: true })
      }
    } else if (index === 3 || index === 5) {
      const stopButton = document.querySelector(
        'button[data-tour-id="stop-btn"]'
      )
      if (stopButton) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (
              m.type === "attributes" &&
              m.attributeName === "disabled" &&
              (!stopButton.getAttribute("disabled") || index === 5)
            ) {
              observer.disconnect()
              setStepIndex(index + 1)
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
      title: (
        <strong>
          <code>Toggle File Sync</code>
        </strong>
      ),
      content: (
        <code>
          File Sync lets you link a folder on your device to manage your
          projects. Existing projects are loaded automatically, and new ones are
          saved there.
        </code>
      ),
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'div[data-tour-id="dashboard"]',
      title: (
        <strong>
          <code>Dashboard</code>
        </strong>
      ),
      content: (
        <code>
          Your projects will appear here. It's empty for now, so let’s create
          one.
        </code>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: 'button[data-tour-id="sound-recorder-btn"]',
      title: (
        <strong>
          <code>Start a new project</code>
        </strong>
      ),
      content: (
        <code>Let's try the Sound Recorder. Grant mic access if prompted.</code>
      ),
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'button[data-tour-id="record-btn"]',
      content: <code>Press record to begin recording audio.</code>,
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: ".editor",
      title: (
        <strong>
          <code>Take notes</code>
        </strong>
      ),
      content: (
        <code>
          Type a few notes. Timestamps should appear automatically at the start
          of each line.
        </code>
      ),
      placement: "left-start",
      disableBeacon: true,
    },
    {
      target: 'button[data-tour-id="stop-btn"]',
      content: <code>Now stop the recording.</code>,
      disableBeacon: true,
      hideFooter: true,
    },
    {
      target: 'div[data-tour-id="editor"]',
      title: (
        <strong>
          <code>Your notes are synced!</code>
        </strong>
      ),
      content: (
        <code>
          Click a timestamp to jump to that moment in the recorded audio.
        </code>
      ),
      placement: "left-start",
      disableBeacon: true,
    },
    {
      target: 'span[data-tour-id="toolbar"]',
      title: (
        <strong>
          <code>Toolbar</code>
        </strong>
      ),
      content: (
        <code>
          Save or close your project from here when you're done editing.
        </code>
      ),
      disableBeacon: true,
      locale: { close: "Exit tour" },
    },
  ]

  return { run, stepIndex, steps, handleOnBeginTour, handleJoyrideCallback }
}
