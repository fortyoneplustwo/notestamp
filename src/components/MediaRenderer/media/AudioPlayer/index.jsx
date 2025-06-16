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
import { Input } from "@/components/ui/input"
import { useWavesurfer } from "@wavesurfer/react"
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js"
import { Button } from "@/components/ui/button"
import { Play, Pause, LucideRepeat2, RotateCw, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import { Toggle } from "@/components/ui/toggle"
import { Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { VolumeX } from "lucide-react"

const AudioPlayer = ({ ref, ...props }) => {
  const [uploadedBlob, setUploadedBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [mimeType, setMimeType] = useState("")
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
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
    container: containerRef,
    waveColor: props.src ? "orangered" : "#3f3f46",
    url: props.src,
    cursorColor: "violet",
    dragToSeek: true,
    normalize: true,
    plugins: plugins,
  })

  useEffect(() => {
    if (!wavesurfer) return
    if (props.src?.startsWith("blob")) fetchByUrl(props.src)

    wavesurfer.on("ready", duration => {
      setDuration(duration)
      wavesurfer.setOptions({ waveColor: "orangered" })
      setVolume(wavesurfer.getVolume())
    })

    return () => {
      audioUrl && window.URL.revokeObjectURL(audioUrl)
      wavesurfer && wavesurfer.destroy()
    }
  }, [wavesurfer])

  useEffect(() => {
    if (props.title) {
      fetchById(props.title)
    }
  }, [props.title, fetchById])

  useEffect(() => {
    if (loadingFetchById) return
    if (errorFetchingById) {
      toast.error("Failed to load project audio")
      console.error("Error fetching project audio")
      return
    }
    if (wavesurfer && blobFromId) {
      const url = window.URL.createObjectURL(blobFromId)
      wavesurfer.load(url)
      setStateOnLoad(url, blobFromId?.type)
    }
  }, [blobFromId])

  useEffect(() => {
    if (loadingFetchByUrl) return
    if (errorFetchingByUrl) {
      toast.error("Failed to load project audio")
      console.error("Error fetching project audio")
      return
    }
    if (wavesurfer && blobFromUrl) {
      wavesurfer.load(props.src)
      setStateOnLoad(props.src, props?.mimetype)
    }
  }, [blobFromUrl])

  useEffect(() => {
    if (audioUrl && regionsRef.current) {
      regionsRef.current.enableDragSelection({
        color: "rgba(255, 0, 0, 0.1)",
      })
    }
  }, [audioUrl])

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
          wavesurfer.playPause()
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

  const setStateOnLoad = (url, mimeType) => {
    window.URL.revokeObjectURL(url)
    url && setAudioUrl(url)
    mimeType && setMimeType(mimeType)
  }

  const handleOnChangeUploadedAudio = blob => {
    if (!blob || !wavesurfer) return
    wavesurfer.loadBlob(blob)
    setUploadedBlob(blob)
    const url = window.URL.createObjectURL(blob)
    setStateOnLoad(url, blob?.type)
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
      regionsRef.current &&
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
      activeRegionRef.current = null
      regionsRef.current.clearRegions()
      regionsRef.current && regionsRef.current.destroy()
    }
  }

  const handleVolumeChange = value => {
    setVolume(value)
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
      <Toolbar className="flex gap-6">
        {!props.src && !props.title && (
          <form
            className="flex w-full max-w-sm items-center gap-1.5"
            onChange={e => handleOnChangeUploadedAudio(e.target.files[0])}
          >
            <Input className="h-6 p-0 text-xs" type="file" accept="audio/*" />
          </form>
        )}
        <span className="flex ml-auto items-center">
          <Button
            variant="ghost"
            size="xs"
            disabled={!isReady}
            onClick={handleToggleMute}
          >
            {isMuted || volume[0] === 0 ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            defaultValue={[volume]}
            max={100}
            step={1}
            className="min-w-20"
            onValueChange={handleVolumeChange}
          />
        </span>
        <span className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="xs"
            disabled={!isReady}
            onClick={handleRewind}
          >
            <RotateCcw />
          </Button>
          <Button
            variant="default"
            size="xs"
            disabled={!isReady}
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!isReady}
            onClick={handleForward}
          >
            <RotateCw />
          </Button>
        </span>
        <span className="flex items-center">
          <Toggle
            size="xs"
            disabled={!isReady}
            onPressedChange={handleToggleLoop}
          >
            <LucideRepeat2 />
          </Toggle>
        </span>
      </Toolbar>
      <div className="diagonal-background flex flex-col h-full justify-center items-center">
        <div
          ref={containerRef}
          className="w-full bg-white dark:bg-mybgsec border-y border-solid dark:border-[#3f3f46]"
        />
      </div>
    </div>
  )
}

export default AudioPlayer
