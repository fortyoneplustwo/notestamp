import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import {
  CircleAlert,
  NotebookPen,
  Stamp,
  History,
  FolderSync,
} from "lucide-react"
import { Compass } from "lucide-react"
import React, { useEffect, useState } from "react"

const WelcomeMessage = ({ onClickTourButton }) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-full w-full overflow-auto px-[10%] pt-[10%] pb-[5%] flex flex-col">
        <div>
          <p className="text-sm">
            <span className="text-[orangered] font-bold text-5xl">
              notestamp
            </span>
            &nbsp;
            <Typewriter text="Write notes in sync with media" delay={30} />
          </p>
          <div className="pt-10 px-5">
            <ul className="list-inside flex flex-col gap-3">
              <FeatureDescp
                icon={NotebookPen}
                text="Take notes alongside videos, audio files, recorders, or PDF documents."
              />
              <FeatureDescp
                icon={Stamp}
                text="Each line is automatically stamped with the media's state at that moment."
              />
              <FeatureDescp
                icon={History}
                text="Click a stamp to jump back to that exact point in the media."
              />
              <FeatureDescp
                icon={FolderSync}
                text="Save your projects locally and reopen them anytime in the app."
              />
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center grow px-40 py-10">
          <Button
            className="grow"
            onClick={onClickTourButton}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <Compass
              className={`${isHover ? "transform rotate-315" : ""}`}
              size={16}
            />
            Take the guided tour
          </Button>
        </div>
        <Alert className="mt-auto">
          <CircleAlert size={16} />
          <AlertDescription>
            For the best experience, we recommend using Chrome on desktop.
          </AlertDescription>
        </Alert>
      </div>
      <div className="self-start mt-auto p-2">
        <a href="https://github.com/fortyoneplustwo/notestamp">
          <GitHubLogoIcon className="w-5 h-5" color="grey" />
        </a>
      </div>
    </div>
  )
}

const FeatureDescp = ({ icon: Icon, text, ...props }) => {
  return (
    <li className="inline-flex items-center gap-3" {...props}>
      <span className="h-full text-base text-[orangered]">
        <Icon size={16} />
      </span>
      <span className="text-[0.9rem]">{text}</span>
    </li>
  )
}

const Typewriter = ({ text, delay }) => {
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, delay, text])

  return <span>{currentText}</span>
}
export default WelcomeMessage
