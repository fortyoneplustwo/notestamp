import { Button } from '@/components/ui/button'
import React from 'react'

const WelcomeMessage = ({ onClickTourButton }) => (
  <>
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
      <p>Take the guided tour to learn how to use the app.</p>
      <br />
      <div>
        <Button onClick={onClickTourButton}>
          Begin Tour
        </Button>
      </div>
      <br />
      <p>
        <strong className="text-red-500">
          Warning: </strong>This app works best on Chrome desktop.
      </p>
      <br></br>
      <p>This project is open source. Report issues on&nbsp; 
        <a href='https://github.com/fortyoneplustwo/notestamp' className='text-blue-600'>github</a>.
      </p>
    </div>
  </>
)

export default WelcomeMessage
