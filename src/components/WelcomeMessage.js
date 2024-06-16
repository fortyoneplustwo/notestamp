import React from 'react'

const WelcomeMessage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ textJustify: 'inter-word', width: '80%', overflow: 'auto', height: '80%' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          Welcome to <span style={{ fontFamily: 'Mosk, sans-serif', fontWeight: 'bold' }}>notestamp</span>, a web app that synchronizes your notes to media.
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>Instructions:</p>
        <ul>
          <li>When recording or viewing media, press <code>&lt;enter&gt;</code> to insert a stamp.</li>
          <li>Press <code>&lt;shift + enter&gt;</code> to escape stamping.</li>
          <li>Click a stamp and instantly seek the media to the stamp value.</li>
          <li>Your notes persist across page reloads unless you clear the browser cache.</li>
          <li>Save your project as a .stmp file, stamps included.</li>
          <li>Export your notes to a .pdf file, stamps excluded.</li>
          <li>Open your project back into the editor for further editing.</li>
        </ul>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          <strong style={{ color: 'red' }}>
            Warning: </strong>This app is still in development and has only been tested on Chrome desktop.
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          Features in development:
          <li>Cloud storage</li>
          <li>Collaborative editing</li>
          <li>Dark Mode</li>
        </p>
        <br></br>
        <p>This project is open source. Contribute on&nbsp; 
          <a href='https://github.com/fortyoneplustwo/notestamp'>github</a>.
        </p>
      </div>
    </div>
  )
}

export default WelcomeMessage
