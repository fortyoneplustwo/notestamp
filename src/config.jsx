import { FileText, Headphones, Mic, TvMinimalPlay } from "lucide-react";

export const defaultMediaConfig = [
  {
    type: "youtube",
    label: "Youtube Player",
    icon: <TvMinimalPlay size={16} />
  },
  {
    type: "audio",
    label: "Audio Player",
    icon: <Headphones size={16}/>
  },
  {
    type: "recorder",
    label: "Sound Recorder",
    icon: <Mic size={16}/>
  },
  {
    type: "pdf",
    label: "Pdf Reader",
    icon: <FileText size={16}/>
  },
]

export const tourSteps = [
    {
      target: ".file-sync-switch",
      title: <h2>Toggle File Sync</h2>,
      content: "File Sync allows you to pick a designated folder on your device from which your existing projects will be sourced and to which new projects will be saved.",
      disableBeacon: true,
    },
    {
      target: ".open-dir-btn",
      title: <h2>Pick a folder on your device</h2>,
      content: "You may click this button at any time to switch directories. Make sure to give persimission to edit files.",
      disableBeacon: true,
    },
    {
      target: ".dashboard",
      title: <h2>Dashboard</h2>,
      content: "This is where your saved projects will appear. It is empty for now, so let's create a new project.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".sound-recorder-btn",
      title: <h2>Start a new project</h2>,
      content: "Let's try the Sound Recorder. Again, give permission to use the microphone as necessary.",
      disableBeacon: true,
    },
    {
      target: ".record-btn",
      content: "Press record to begin recording audio.",
      disableBeacon: true,
    },
    {
      target: ".editor",
      title: <h2>Take notes</h2>,
      content: "Focus the editor, press <Enter> to insert a stamp, then type up some notes -- at least 2 lines.",
      placement: "left-start",
      disableBeacon: true,
    },
    {
      target: ".stop-btn",
      content: "Stop the recording.",
      disableBeacon: true,
    },
    {
      target: ".editor",
      title: <h2>Your notes are synced to the recorded audio</h2>,
      content: "Click a timestamp to seek the audio recording to it. You may edit your notes further before saving and closing the project.",
      placement: "left-start",
      disableBeacon: true,
      locale: { close: "Close", },
    },
  ]
