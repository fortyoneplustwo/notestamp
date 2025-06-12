import React, { useEffect, useImperativeHandle, useRef, useState } from "react"
import "../../style/Background.css"
import { formatTime } from "../../utils/formatTime"
import { useWavesurfer } from "@wavesurfer/react"
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js"
import { Toolbar } from "../../components/Toolbar"
import { toast } from "sonner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Circle, Pause, Square } from "lucide-react"
import EventEmitter from "@/utils/EventEmitter"

const AudioRecorder = ({ ref, ...props }) => {
  const [started, setStarted] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [value, setValue] = useState("")
  const [paused, setPaused] = useState(false)
  const containerRef = useRef(null)
  const recorderRef = useRef(null)
  const durationRef = useRef(null)

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    waveColor: "#3f3f46",
    progressColor: "rgb(100, 0, 100)",
    interact: false,
    cursorColor: "transparent",
    fillParent: true,
    minPxPerSec: 1,
  })

  // display a fake waveform as placeholder on init
  const placeholderPeaks = new Array(100)
    .fill(0)
    .map(() => Math.random() * 2 - 1)

  useEffect(() => {
    if (wavesurfer) {
      if (recorderRef.current) return

      if (!started) wavesurfer.load("", placeholderPeaks, 60)

      const recorder = wavesurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: true,
        })
      )

      if (!recorder) {
        toast.error("Failed to initialize recorder")
        console.error("Error attaching record plugin")
        return
      }

      recorderRef.current = recorder

      recorder.on("record-progress", duration => {
        durationRef.current = duration
      })

      recorder.on("record-end", blob => {
        setStopped(true)
        EventEmitter.dispatch("open-media-with-src", {
          type: "audio",
          src: blob,
        })
      })
    }

    return () => {
      if (recorderRef.current) recorderRef.current.destroy()
      if (wavesurfer) wavesurfer.destroy()
    }
  }, [wavesurfer])

  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        const timestamp = durationRef.current
          ? Math.floor(durationRef.current / 1000)
          : null
        return {
          label: formatTime(timestamp),
          value: timestamp,
        }
      },
      getMetadata: () => {
        return { ...props }
      },
    }
  }, [props])

  const handleStartRec = async () => {
    try {
      wavesurfer.empty() // clear placeholder
      if (!recorderRef.current) return
      wavesurfer.setOptions({
        waveColor: "orangered",
      })
      await recorderRef.current.startRecording()
      setStarted(true)
    } catch (error) {
      toast.error("Failed to start recording")
      console.error("Error starting recording:", error)
    }
  }

  const handlePauseRec = async () => {
    try {
      if (!recorderRef.current) return
      await recorderRef.current.pauseRecording()
      setPaused(true)
    } catch (error) {
      toast.error("Failed to pause recording")
      console.error("Error pausing recording:", error)
    }
  }

  const handleResumeRec = async () => {
    try {
      if (!recorderRef.current) return
      await recorderRef.current.resumeRecording()
      setPaused(false)
    } catch (error) {
      toast.error("Failed to resume recording")
      console.error("Error resuming recording:", error)
    }
  }

  const handleStopRec = async () => {
    try {
      if (!recorderRef.current) return
      await recorderRef.current.stopRecording()
      setStopped(true)
    } catch (error) {
      toast.error("Failed to stop recording")
      console.error("Error stopping recording:", error)
    }
  }

  const handleRecorderToggles = toggledValue => {
    setValue(toggledValue)
    switch (toggledValue) {
      case "pause":
        return handlePauseRec()
      case "stop":
        return handleStopRec()
      default:
        if (started) {
          return handleResumeRec()
        }
        return handleStartRec()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar className="flex justify-center">
        <ToggleGroup
          type="single"
          variant="outline"
          size="xs"
          value={value}
          className="bg-background dark:bg-mybgsec"
          onValueChange={handleRecorderToggles}
        >
          <ToggleGroupItem
            value="record"
            aria-label="Toggle record"
            disabled={(started && !paused) || stopped}
          >
            <Circle size={16} fill="red" strokeWidth={0} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="pause"
            aria-label="Toggle pause"
            disabled={!started || paused || stopped}
          >
            <Pause size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="stop"
            aria-label="Toggle stop"
            disabled={!started || stopped}
          >
            <Square size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </Toolbar>
      <div className="diagonal-background flex flex-col justify-center items-center w-full h-full">
        <div
          ref={containerRef}
          className="w-full bg-white dark:bg-mybgsec border-y border-solid dark:border-[#3f3f46]"
        />
        <div></div>
      </div>
    </div>
  )
}

export default AudioRecorder
