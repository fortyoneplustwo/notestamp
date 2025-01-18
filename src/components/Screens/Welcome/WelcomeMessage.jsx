import { Button } from '@/components/ui/button'
import React from 'react'

const WelcomeMessage = ({ onClickTourButton }) => (
  <>
    <div className="h-full w-full overflow-auto p-[10%]">
      <p>
        Welcome to <span className="text-[orangered] font-bold">notestamp</span>, a web application designed to revolutionize note-taking.
      </p>
      <br />
      <p>Whether you're studying, attending lectures, or consuming media, notestamp ensures that your notes are contextually linked, enhancing comprehension and retention.</p>
      <br></br>
      <p>Key features:</p>
      <p>
        <li><strong>Synchronized note-taking: </strong>By inserting stamps, you can link specific points in your notes to exact moments in the related media.</li>
        <li><strong>Interactive stamps: </strong>Clicking on a stamp instantly returns the media to the recorded point, streamlining the review process.</li>
      </p>
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
