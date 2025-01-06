import React from 'react'

const WelcomeMessage = () => (
  <>
    <div className="h-full w-full overflow-auto p-[10%]">
      <p>
        Welcome to <span className="text-[orangered] font-bold">notestamp</span>, a web app that synchronizes your notes to media.
      </p>
      <br></br>
      <p>Instructions:</p>
      <p>
        <li>When recording or viewing media, press <code>&lt;enter&gt;</code> to insert a stamp.</li>
        <li>Press <code>&lt;shift + enter&gt;</code> to escape stamping.</li>
        <li>Click a stamp and instantly seek the media to the stamp value.</li>
        <li>Your notes persist across page reloads unless you clear the browser cache.</li>
      </p>
      <br />
      <p>Since the backend is still under development, we have released a feature that lets you save your projects locally. Toggle the <code>File Sync</code> switch to get started.</p>
      <br></br>
      <p>
        <strong className="text-red-500">
          Warning: </strong>This app works best on Chrome desktop.
      </p>
      <br></br>
      <p>
        Features to come:
        <li>Cloud storage</li>
        <li>Collaborative editing</li>
      </p>
      <br></br>
      <p>This project is open source. Report issues on&nbsp; 
        <a href='https://github.com/fortyoneplustwo/notestamp' className='text-blue-600'>github</a>.
      </p>
    </div>
  </>
)

export default WelcomeMessage
