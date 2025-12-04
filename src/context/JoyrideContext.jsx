import { create } from "zustand"
import { ACTIONS, EVENTS, STATUS } from "react-joyride"

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
    placement: "right-end",
    disableBeacon: true,
  },
  {
    target: 'button[data-tour-id="sound-recorder-btn"]',
    title: <strong>Start a New Project</strong>,
    content: "Let's try the Sound Recorder. Allow microphone access if asked.",
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
    content: "Save and close your project when you're done.",
    disableBeacon: true,
    locale: { close: "Exit Tour" },
  },
]

export const useJoyrideContext = create((set, get) => ({
  steps: steps,
  run: false,
  stepIndex: 0,
  handleOnBeginTour: () => set({ run: true }),
  handleJoyrideCallback: (data) => {
    const { action, index, status, type } = data

    if (get().stepIndex === 0 && type === EVENTS.STEP_BEFORE) {
      const leftPane = document.querySelector('div[data-tour-id="left-pane"]')
      if (leftPane) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (m.addedNodes.length > 0) {
              set((state) => ({ stepIndex: state.stepIndex + 1 }))
              observer.disconnect()
            }
          }
        }).observe(leftPane, { childList: true })
      }
    } else if (get().stepIndex === 2) {
      const leftPane = document.querySelector('div[data-tour-id="left-pane"]')
      if (leftPane) {
        new MutationObserver((mutations, observer) => {
          for (const m of mutations) {
            if (m.addedNodes.length > 0) {
              if (get().run) set(() => ({ run: false }))
            }
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                const recordButton = node.querySelector(
                  'button[data-tour-id="record-btn"]'
                )
                if (recordButton) {
                  setTimeout(() => {
                    set(() => ({
                      stepIndex: index + 1,
                      run: true,
                    }))
                    observer.disconnect()
                  }, 50) // Timeout makes the transition less jarring
                }
              }
            }
          }
        }).observe(leftPane, { childList: true, subtree: true })
      }
    } else if (get().stepIndex === 3) {
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
              set(state => ({ stepIndex: state.stepIndex + 1 }))
              observer.disconnect()
            }
          }
        }).observe(stopButton, {
          attributes: true,
          attributeFilter: ["disabled"],
        })
      }
    } else if (get().stepIndex === 5) {
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
              set(state => ({ stepIndex: state.stepIndex + 1 }))
              observer.disconnect()
            }
          }
        }).observe(stopButton, {
          attributes: true,
          attributeFilter: ["disabled"],
        })
      }
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      set(() => ({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) }))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      set(() => ({
        run: false,
        stepIndex: 0,
      }))
    }
  }
}))
