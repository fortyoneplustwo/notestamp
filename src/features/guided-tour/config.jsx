export const steps = [
  {
    target: 'span[data-tour-id="file-sync-switch"]',
    title: <strong>Toggle File Sync</strong>,
    content: (
      "Link a folder on your device to load existing projects and save new ones."
    ),
    disableBeacon: true,
    hideFooter: true,
  },
  {
    target: 'div[data-tour-id="dashboard"]',
    title: <strong>Dashboard</strong>,
    content: (
      "Your projects will show up here. It's empty for now, so let's create one!"
    ),
    placement: "right-start",
    disableBeacon: true,
  },
  {
    target: 'button[data-tour-id="sound-recorder-btn"]',
    title: <strong>Start a New Project</strong>,
    content: (
      "Let's try the Sound Recorder. Allow microphone access if asked."
    ),
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
    content: (
      "Type a few notes. Notice how a timestamp appears at the start of each line."
    ),
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
    content: (
      "Click a timestamp to jump to that moment in the recording."
    ),
    placement: "left-start",
    disableBeacon: true,
  },
  {
    target: 'span[data-tour-id="toolbar"]',
    title: <strong>Toolbar</strong>,
    content: (
      "Save or close your project when you're done."
    ),
    disableBeacon: true,
    locale: { close: "Exit Tour" },
  },
];
