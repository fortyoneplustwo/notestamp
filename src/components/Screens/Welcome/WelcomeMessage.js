import React from 'react'

const WelcomeMessage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ textJustify: 'inter-word', width: '80%', overflow: 'auto', height: '80%' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          Welcome to <span style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold', color: 'orangered' }}>notestamp</span>, a web app that synchronizes your notes to media.
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>Instructions:</p>
        <p>
          <li>When recording or viewing media, press <code>&lt;enter&gt;</code> to insert a stamp.</li>
          <li>Press <code>&lt;shift + enter&gt;</code> to escape stamping.</li>
          <li>Click a stamp and instantly seek the media to the stamp value.</li>
          <li>Your notes persist across page reloads unless you clear the browser cache.</li>
        </p>
        <br />
        <p style={{ whiteSpace: 'pre-wrap' }}>Managing projects in Sync Mode:</p>
        <p>
          <li>Toggle the <code>Sync</code> button to enable synchronization.</li>
          <li>Click <code>Open directory</code> to pick a folder on your device.</li>
          <li>In Sync Mode, you are able to save a project to the chosen directory.</li>
          <li>Any projects saved to that directory will be listed in the left pane.</li>
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          <strong style={{ color: 'red' }}>
            Warning: </strong>This app is still in development and has only been tested on Chrome desktop.
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          Features in development:
          <li>Dark Mode</li>
          <li>Collaborative editing</li>
        </p>
        <br></br>
        <p>This project is open source. Contribute on&nbsp; 
          <a href='https://github.com/fortyoneplustwo/notestamp' className='text-blue-600'>github</a>.
        </p>
      </div>
    </div>
  )
}

export default WelcomeMessage
