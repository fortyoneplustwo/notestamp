import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import React from 'react'

const WelcomeMessage = ({ onClickTourButton }) => (
  <div className="h-full w-full flex flex-col">
    <div className="h-full w-full overflow-auto p-[10%]">
      <p>
        Welcome to <span className="text-[orangered] font-bold">notestamp</span>, a web application designed to enhance note-taking.
      </p>
      <br />
      <p>When recording or viewing media, your typed notes are contextually linked to enhance comprehension and retention.</p>
      <br></br>
      <p>How it works:</p>
      <br />
      <ul className="list-inside list-disc">
        <li>Each note line is automatically stamped to match moments in the media.</li>
        <li>Clicking a stamp returns the media to the recorded point.</li>
      </ul>
      <br />
      <div className="flex justify-center py-7 px-40">
        <Button className="grow" onClick={onClickTourButton}>
          Take the guided tour
        </Button>
      </div>
      <br></br>
      <p>
        💡
        <em>
          For the best experience, we recommend using Chrome Desktop.
        </em>
      </p>
      <br></br>
    </div>
    <div className="self-start mt-auto p-2">
      <a href='https://github.com/fortyoneplustwo/notestamp'>
        <Github size={20} color="grey" />
      </a>
    </div>
  </div>
)

export default WelcomeMessage
