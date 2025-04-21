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
