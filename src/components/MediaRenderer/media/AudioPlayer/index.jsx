import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  useGetProjectMedia,
  useGetProjectMediaByUrl,
} from "@/hooks/useReadData"
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

const AudioPlayer = ({ ref, ...props }) => {
  const [uploadedBlob, setUploadedBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [mimeType, setMimeType] = useState("")
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [mediaAvailable, setMediaAvailable] = useState(false)
  const [loopActive, setLoopActive] = useState(false)

  const containerRef = useRef(null)
  const regionsRef = useRef(null)
  const activeRegionRef = useRef(null)

  const {
    data: blobFromId,
    fetchById,
    loading: loadingFetchById,
    error: errorFetchingById,
  } = useGetProjectMedia()
  const {
    data: blobFromUrl,
    fetchByUrl,
    loading: loadingFetchByUrl,
    error: errorFetchingByUrl,
  } = useGetProjectMediaByUrl()

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
    if (props.src?.startsWith("blob")) {
      // Passed from sound recorder
      wavesurfer.load(props.src)
      fetchByUrl(props.src)
      setAudioUrl(props.src)
      setMimeType(props?.mimetype)
    } else if (uploadedBlob) {
      // Uploaded through dropzone
      wavesurfer.loadBlob(uploadedBlob)
      setUploadedBlob(uploadedBlob)
      const url = window.URL.createObjectURL(uploadedBlob)
      setAudioUrl(url)
      setMimeType(uploadedBlob?.type)
    } else if (blobFromId) {
      // Fetched from a previously saved project
      wavesurfer.loadBlob(blobFromId)
      const url = window.URL.createObjectURL(blobFromId)
      setAudioUrl(url)
      setMimeType(blobFromId?.type)
    }

    wavesurfer.on("ready", duration => {
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

  useEffect(() => {
    if (props.title) {
      fetchById(props.title)
    } else if (props.src) {
      setMediaAvailable(true)
    }
  }, [])

  useEffect(() => {
    if (loadingFetchById) return
    if (errorFetchingById) {
      toast.error("Failed to load project audio")
      console.error("Error fetching project audio")
      return
    }
    if (blobFromId) setMediaAvailable(true)
  }, [blobFromId])

  useEffect(() => {
    if (loadingFetchByUrl) return
    if (errorFetchingByUrl) {
      toast.error("Failed to load project audio")
      console.error("Error fetching project audio")
      return
    }
    if (blobFromUrl) setMediaAvailable(true)
  }, [blobFromUrl])

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
              mimetype: mimeType || props.mimetype,
              src: "",
            }
          : null
      },
      getMedia: () => {
        return uploadedBlob || blobFromUrl || blobFromId
      },
    }
  }, [props, audioUrl])

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
    <div className="flex flex-col h-full">
      {(props.src || props.title || mediaAvailable) && (
        <Toolbar className="gap-3">
          {mediaAvailable && !props.title && !props.src && (
            <FileInput
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
                title="Mute/unmute"
                disabled={!isReady}
                onClick={handleToggleMute}
              >
                {isMuted || volume[0] === 0 ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider
                title="Volume slider"
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
            ref={containerRef}
            className="w-full bg-white dark:bg-mybgsec border-y border-solid dark:border-[#3f3f46]"
          />
        )}
      </div>
    </div>
  )
}

export default AudioPlayer
