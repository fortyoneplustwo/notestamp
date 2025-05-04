import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CircleAlert } from 'lucide-react'
import { Compass } from 'lucide-react'
import { Github } from 'lucide-react'
import React from 'react'

const WelcomeMessage = ({ onClickTourButton }) => (
  <div className="h-full w-full flex flex-col">
    <div className="h-full w-full overflow-auto px-[10%] pt-[10%] pb-[5%] flex flex-col">
      <p>
        Welcome to <span className="text-[orangered] font-bold">notestamp</span>, a web application designed to enhance note-taking.
      </p>
      <br />
      <p>When recording or viewing media, your typed notes are contextually linked to enhance comprehension and retention.</p>
      <br></br>
      <h1 className="font-bold">How it works:</h1>
      <br />
      <ul className="list-inside list-disc">
        <li>Each note line is automatically stamped to match moments in the media.</li>
        <li>Clicking a stamp returns the media to the recorded point.</li>
      </ul>
      <div className="flex items-center justify-center grow px-40 py-10">
        <Button className="grow" onClick={onClickTourButton}>
          <Compass size={16} />
          Take the guided tour
        </Button>
      </div>
      <Alert className="mt-auto">
        <CircleAlert size={16} />
        <AlertDescription>For the best experience, we recommend using Chrome on desktop</AlertDescription>
      </Alert>
    </div>
    <div className="self-start mt-auto p-2">
      <a href='https://github.com/fortyoneplustwo/notestamp'>
        <Github size={20} color="grey" />
      </a>
    </div>
  </div>
)

export default WelcomeMessage
