import { FileText, Headphones, Mic, TvMinimalPlay } from "lucide-react"
import { myMediaComponents as customMediaConfig } from "./components/MediaRenderer/config"

export const defaultMediaConfig = [
  {
    type: "youtube",
    label: "Youtube Player",
    icon: <TvMinimalPlay size={16} />,
    dir: "YoutubePlayer",
    hotkeys: [
      {
        action: "Play/pause",
        hotkey: ["mod", "k"],
      },
      {
        action: "Seek forward",
        hotkey: ["mod", "0"],
      },
      {
        action: "Seek backward",
        hotkey: ["mod", "9"],
      },
    ],
  },
  {
    type: "audio",
    label: "Audio Player",
    icon: <Headphones size={16} />,
    dir: "AudioPlayer",
    hotkeys: [
      {
        action: "Play/pause",
        hotkey: ["mod", "k"],
      },
      {
        action: "Seek forward",
        hotkey: ["mod", "0"],
      },
      {
        action: "Seek backward",
        hotkey: ["mod", "9"],
      },
      {
        action: "Mute",
        hotkey: ["mod", "m"],
      },
    ],
  },
  {
    type: "recorder",
    label: "Sound Recorder",
    icon: <Mic size={16} />,
    dir: "AudioRecorder",
  },
  {
    type: "pdf",
    label: "Pdf Reader",
    icon: <FileText size={16} />,
    dir: "PdfReader",
    hotkeys: [
      {
        action: "Page next",
        hotkey: ["mod", "0"],
      },
      {
        action: "Page back",
        hotkey: ["mod", "9"],
      },
      {
        action: "Zoom in",
        hotkey: ["mod", "]"],
      },
      {
        action: "Zoom out",
        hotkey: ["mod", "["],
      },
    ],
  },
  ...customMediaConfig,
]

export const validKeys = [
  "type",
  "title",
  "src",
  "label",
  "mimetype",
  "lastModified",
]
