import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import "./style.css"

const controller = new AbortController()

const onNavigate = options => {
  const { precommitHandler, handler, to } = options
  const navigation = window.navigation
  navigation.addEventListener(
    "navigate",
    event => {
      if (!event.canIntercept) return
      if (event.hashChange || event.downloadRequest !== null) return
      const url = new URL(event.destination.url)
      if (url.pathname.startsWith(to)) {
        event.intercept({
          precommitHandler: precommitHandler.bind(options),
          handler: handler.bind(options),
        })
      }
    },
    { once: true, signal: controller.signal }
  )
}

export const tour = driver({
  showProgress: true,
  popoverClass: "custom",
  nextBtnText: "Next",
  doneBtnText: "End tour",
  overlayClickBehavior: () => {},
  onDestroyStarted: () => {
    if (!tour.hasNextStep() || confirm("Exit tour?")) {
      tour.destroy()
    }
  },
  onDestroyed: () => {
    controller.abort()
  },
  steps: [
    {
      element: 'span[data-tour-id="file-sync-switch"]',
      popover: {
        title: "Toggle file sync",
        description:
          "Link a folder on your device to load existing projects and save new ones.",
        showButtons: ["close"],
        side: "bottom",
        align: "end",
      },
      onHighlighted: (_, __, options) => {
        onNavigate({
          to: "/dashboard",
          hasNavigated: false,
          precommitHandler: function () {
            const leftPane = document.querySelector(
              'div[data-tour-id="left-pane"]'
            )
            if (leftPane) {
              new MutationObserver((mutations, observer) => {
                for (const m of mutations) {
                  if (
                    this.hasNavigated &&
                    m.addedNodes.length > 0 &&
                    m.addedNodes[0]?.dataset?.tourId === "dashboard"
                  ) {
                    setTimeout(() => {
                      observer.disconnect()
                      options.driver.moveNext()
                    }, 50) // Timeout makes the transition less jarring
                  }
                }
              }).observe(leftPane, { childList: true })
            }
          },
          handler: function () {
            this.hasNavigated = true
          },
        })
      },
    },
    {
      element: 'div[data-tour-id="dashboard"]',
      popover: {
        title: "This is your dashboard",
        description:
          "Your projects will show up here. It's empty for now, so let's create one!",
        showButtons: ["next", "close"],
        side: "right",
      },
    },
    {
      element: 'button[data-tour-id="sound-recorder-btn"]',
      popover: {
        title: "Start a new project",
        description:
          "Let's try taking notes while recording audio. Make sure to allow microphone access.",
        showButtons: ["close"],
        side: "bottom",
      },
      onHighlighted: (_, __, options) => {
        onNavigate({
          to: "/recorder",
          hasNavigated: false,
          precommitHandler: function () {
            const leftPane = document.querySelector(
              'div[data-tour-id="left-pane"]'
            )
            if (leftPane) {
              new MutationObserver((mutations, observer) => {
                for (const m of mutations) {
                  for (const node of m.addedNodes) {
                    if (node.nodeType === 1 && this.hasNavigated) {
                      const recordButton = node.querySelector(
                        'button[data-tour-id="record-btn"]'
                      )
                      if (recordButton) {
                        setTimeout(() => {
                          observer.disconnect()
                          options.driver.moveNext()
                        }, 50) // Timeout makes the transition less jarring
                      }
                    }
                  }
                }
              }).observe(leftPane, { childList: true, subtree: true })
            }
          },
          handler: function () {
            this.hasNavigated = true
          },
        })
      },
    },
    {
      element: 'button[data-tour-id="record-btn"]',
      popover: {
        description: "Press record to start capturing audio.",
        showButtons: ["close"],
        side: "bottom",
      },
      onHighlighted: (_, __, options) => {
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
                observer.disconnect()
                options.driver.moveNext()
              }
            }
          }).observe(stopButton, {
            attributes: true,
            attributeFilter: ["disabled"],
          })
        }
      },
    },
    {
      element: 'div[data-tour-id="editor"]',
      popover: {
        title: "Take notes",
        description:
          "Type a few lines. Notice how a timestamp appears at the start of each line.",
        showButtons: ["next", "close"],
        side: "left",
      },
    },
    {
      element: 'button[data-tour-id="stop-btn"]',
      popover: {
        description: "Press stop to end the recording.",
        showButtons: ["close"],
        side: "bottom",
      },
      onHighlighted: (_, __, options) => {
        onNavigate({
          to: "/audio",
          hasNavigated: false,
          precommitHandler: function () {
            const leftPane = document.querySelector(
              'div[data-tour-id="left-pane"]'
            )
            if (leftPane) {
              new MutationObserver((mutations, observer) => {
                for (const m of mutations) {
                  if (
                    this.hasNavigated &&
                    m.addedNodes.length > 0 &&
                    m.addedNodes[0]?.dataset?.tourId === "audio-player"
                  ) {
                    setTimeout(() => {
                      observer.disconnect()
                      options.driver.moveNext()
                    }, 50) // Timeout makes the transition less jarring
                  }
                }
              }).observe(leftPane, { childList: true, subtree: true })
            }
          },
          handler: function () {
            this.hasNavigated = true
          },
        })
      },
    },
    {
      element: 'div[data-tour-id="editor"]',
      popover: {
        title: "Your notes are synced!",
        description:
          "Click a timestamp to jump to that moment in the recording.",
        showButtons: ["next", "close"],
        side: "left",
      },
    },
    {
      element: 'span[data-tour-id="toolbar"]',
      popover: {
        title: "This is your toolbar",
        description: "Save and close your project when you're done.",
        showButtons: ["next", "close"],
        side: "bottom",
      },
    },
  ],
})
