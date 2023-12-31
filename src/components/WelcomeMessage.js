import React from 'react'

const WelcomeMessage = () => {
  return (
    <div style={{ display: 'flex', flexGrow: '1', overflow: 'scroll', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ overflow: 'scroll', textJustify: 'inter-word', width: '80%' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          Welcome to <strong>notestamp</strong>, a web app that synchronizes your notes to media.
        </p>
        <br></br>
        <p style={{ whiteSpace: 'pre-wrap' }}>Instructions:</p>
        <ul>
          <li>When recording or viewing media, press <code>&lt;enter&gt;</code> to insert a stamp.</li>
          <li>Press <code>&lt;shift + enter&gt;</code> to avoid stamping.</li>
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
          <ul>
            <li>Cloud storage (subscription based plan)</li>
          </ul>
        </p>
      </div>
    </div>
  )
}

export default WelcomeMessage
