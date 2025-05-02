import { FileText, Headphones, Mic, TvMinimalPlay } from "lucide-react";
import { myMediaComponents as customMediaConfig } from "./components/MediaRenderer/config";

export const defaultMediaConfig = [
  {
    type: "youtube",
    label: "Youtube Player",
    icon: <TvMinimalPlay size={16} />,
    dir: "YoutubePlayer",
  },
  {
    type: "audio",
    label: "Audio Player",
    icon: <Headphones size={16}/>,
    dir: "AudioPlayer",
  },
  {
    type: "recorder",
    label: "Sound Recorder",
    icon: <Mic size={16}/>,
    dir: "AudioRecorder",
  },
  {
    type: "pdf",
    label: "Pdf Reader",
    icon: <FileText size={16}/>,
    dir: "PdfReader",
  },
  ...customMediaConfig,
]
