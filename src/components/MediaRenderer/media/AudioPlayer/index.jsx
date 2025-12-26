import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Toolbar } from "../../components/Toolbar"
import "../../style/Background.css"
import { formatTime } from "../../utils/formatTime"
import { useWavesurfer } from "@wavesurfer/react"
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  LucideRepeat2,
  RotateCw,
  RotateCcw,
  VolumeX,
  Volume2,
  FileAudio,
} from "lucide-react"
import { toast } from "sonner"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import { Toggle } from "@/components/ui/toggle"
import { Slider } from "@/components/ui/slider"
import { Dropzone } from "../../components/Dropzone"
import { FileInput } from "../../components/FileInput"
import isHotkey from "is-hotkey"
import { useQuery } from "@tanstack/react-query"
import { fetchMediaById, fetchMediaByUrl } from "@/lib/fetch/api-read"

const AudioPlayer = ({ ref, ...props }) => {
  const [uploadedBlob, setUploadedBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [mediaAvailable, setMediaAvailable] = useState(false)

  const [mimeType, setMimeType] = useState("")
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [loopActive, setLoopActive] = useState(false)

  const hotkeyActions = useMemo(() => new Map([
    ["mod+k", () => handlePlayPause()],
    ["mod+9", () => handleRewind()],
    ["mod+0", () => handleForward()],
    ["mod+m", () => handleToggleMute()],
  ]), [])

  const containerRef = useRef(null)
  const regionsRef = useRef(null)
  const activeRegionRef = useRef(null)

  const fetchBlobById = useQuery({
    queryFn: () => fetchMediaById(props.title),
    queryKey: ["media", props.title],
    enabled: !!props?.title,
  })
  const fetchBlobByUrl = useQuery({
    queryFn: () => fetchMediaByUrl(props.src),
    queryKey: ["media", props.src],
    enabled: !!props?.src,
  })

  useEffect(() => {
    if (!mediaAvailable && fetchBlobById.isSuccess && fetchBlobById.data) {
      setMediaAvailable(true)
    }
  }, [fetchBlobById.isSuccess, fetchBlobById.data, mediaAvailable])
  useEffect(() => {
    if (!mediaAvailable && fetchBlobByUrl.isSuccess && fetchBlobByUrl.data) {
      setMediaAvailable(true)
    }
  }, [fetchBlobByUrl, mediaAvailable])

  const plugins = useMemo(() => {
    return [
      Hover.create({
        lineColor: "violet",
        lineWidth: 2,
        labelBackground: "purple",
        labelColor: "white",
        labelSize: "11px",
      }),
    ]
  }, [])

  const wavesurferRef = useRef(null)

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: mediaAvailable ? containerRef : null,
    waveColor: "orangered",
    cursorColor: "violet",
    dragToSeek: true,
    normalize: true,
    plugins: plugins,
  })

  useEffect(() => {
    if (!wavesurfer) return

    // On init, media can come from only 3 possible sources
    if (props.src?.startsWith("blob") && props.mimetype) {
      // Passed from sound recorder
      wavesurfer.load(props.src)
      setAudioUrl(props.src)
      setMimeType(props?.mimetype)
    } else if (uploadedBlob) {
      // Uploaded through dropzone
      wavesurfer.loadBlob(uploadedBlob)
      const url = window.URL.createObjectURL(uploadedBlob)
      setAudioUrl(url)
      setMimeType(uploadedBlob?.type)
    } else if (props?.title) {
      // Fetched from a previously saved project
      wavesurfer.loadBlob(fetchBlobById.data)
      const url = window.URL.createObjectURL(fetchBlobById.data)
      setAudioUrl(url)
      setMimeType(props?.mimetype)
    }

    wavesurfer.on("ready", duration => {
      wavesurferRef.current = wavesurfer
      setDuration(duration)
      wavesurfer.setOptions({ waveColor: "orangered" })
      setVolume(wavesurfer.getVolume())
    })

    wavesurfer.on("error", error => toast.error(error.message))

    return () => {
      audioUrl && window.URL.revokeObjectURL(audioUrl)
      wavesurfer && wavesurfer.destroy()
    }
  }, [wavesurfer])

  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        if (wavesurfer) {
          return {
            label: currentTime ? formatTime(currentTime) : null,
            value: currentTime,
          }
        } else {
          return null
        }
      },
      setState: newState => {
        if (wavesurfer) {
          wavesurfer.setTime(newState)
          wavesurfer.play()
        }
      },
      getMetadata: () => {
        return wavesurfer
          ? {
              ...props,
              mimetype: props.mimetype || mimeType,
              src: "",
            }
          : null
      },
      getMedia: () => {
        return uploadedBlob || fetchBlobByUrl.data || fetchBlobById.data
      },
      handleHotkey: event => {
        for (const [hotkey, action] of hotkeyActions.entries()) {
          if (isHotkey(hotkey, event)) {
            event.preventDefault()
            return action()
          }
        }
      },
    }
  }, [
    props,
    fetchBlobById,
    fetchBlobByUrl,
    mimeType,
    currentTime,
    hotkeyActions,
    uploadedBlob,
    wavesurfer,
  ])

  const handleDropzoneAccept = file => {
    setMediaAvailable(() => {
      setUploadedBlob(file)
      return true
    })
  }

  const handleOnChangeUpload = file => {
    wavesurfer && wavesurfer.loadBlob(file)
    window.URL.revokeObjectURL(audioUrl)
    const url = window.URL.createObjectURL(file)
    setUploadedBlob(file)
    setAudioUrl(url)
    setMimeType(file?.type)
  }

  const handlePlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  const handleRewind = () => {
    wavesurfer && wavesurfer.setTime(currentTime - 0.01 * duration)
  }

  const handleForward = () => {
    wavesurfer && wavesurfer.setTime(currentTime + 0.01 * duration)
  }

  const handleToggleLoop = pressed => {
    if (pressed && wavesurfer) {
      regionsRef.current = wavesurfer.registerPlugin(RegionsPlugin.create())
      if (!regionsRef.current) {
        setLoopActive(false)
        return
      }
      setLoopActive(true)
      regionsRef.current.enableDragSelection({
        color: "rgba(255, 0, 0, 0.1)",
      })
      regionsRef.current.on(
        "region-in",
        region => (activeRegionRef.current = region)
      )
      regionsRef.current.on("region-out", region => {
        if (activeRegionRef.current === region) region.play()
      })
      regionsRef.current.on("region-clicked", (region, e) => {
        e.stopPropagation()
        activeRegionRef.current = region
        region.play()
      })
    } else {
      setLoopActive(false)
      activeRegionRef.current = null
      regionsRef.current.clearRegions()
      regionsRef.current && regionsRef.current.destroy()
    }
  }

  const handleVolumeChange = value => {
    setVolume(value)
    wavesurfer && wavesurfer.setVolume(value / 100)
  }

  const handleToggleMute = () => {
    if (wavesurfer) {
      setIsMuted(prev => {
        wavesurfer.setMuted(!prev)
        return !prev
      })
    }
  }

  return (
    <div data-testid="audio-player" className="flex flex-col h-full">
      {(props.src || props.title || mediaAvailable) && (
        <Toolbar className="gap-3">
          {mediaAvailable && !props.title && !props.src && (
            <FileInput
              data-testid="change-file-input"
              filename={uploadedBlob?.name}
              onOpen={handleOnChangeUpload}
            />
          )}
          <span className="inline-flex grow-1">
            <span className="flex gap-2 items-center">
              <Button
                variant="default"
                size="xs"
                aria-label="Toggle play/pause"
                aria-pressed={isPlaying}
                title="Play/pause"
                disabled={!isReady}
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                title="Skip backward"
                disabled={!isReady}
                onClick={handleRewind}
              >
                <RotateCcw />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                title="Skip forward"
                disabled={!isReady}
                onClick={handleForward}
              >
                <RotateCw />
              </Button>
              <Toggle
                aria-label="Toggle loop"
                aria-pressed={loopActive}
                variant="toolbar"
                size="xs"
                title="Loop region"
                disabled={!isReady}
                pressed={loopActive}
                onPressedChange={handleToggleLoop}
              >
                <LucideRepeat2 />
              </Toggle>
            </span>
            <span className="flex ml-auto items-center">
              <Button
                aria-label="Toggle mute/unmute"
                aria-pressed={isMuted || volume === 0}
                variant="ghost"
                size="xs"
                title="Mute"
                disabled={!isReady}
                onClick={handleToggleMute}
              >
                {isMuted || volume[0] === 0 ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider
                title="Volume"
                defaultValue={[volume]}
                max={100}
                step={1}
                className="min-w-30"
                onValueChange={handleVolumeChange}
              />
            </span>
          </span>
        </Toolbar>
      )}
      <div className="diagonal-background flex flex-col h-full justify-center items-center">
        {!mediaAvailable && !props.title && !props.src && (
          <Dropzone
            icon={FileAudio}
            message="Drop your audio file here"
            accept={{
              "audio/*": [],
              "video/webm": [],
            }}
            onAccept={handleDropzoneAccept}
          />
        )}
        {(mediaAvailable || props.src) && (
          <div
            data-testid="wavesurfer-container"
            ref={containerRef}
            className="w-full bg-white dark:bg-mybgsec border-y border-solid dark:border-[#3f3f46]"
          />
        )}
      </div>
    </div>
  )
}

export default AudioPlayer
