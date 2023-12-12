import React from 'react'

const WelcomeMessage = () => {
  return (
    <div style={{ alignSelf: 'center'}}>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        Welcome to <strong>Notestamp</strong>, a web app that synchronizes your notes to media.
      </pre>
      <br></br>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        Instructions:
        <ul>
          <li>When recording or viewing media, press &lt;enter&gt; to insert a stamp.</li>
          <li>&lt;shift + enter&gt; to avoid stamping.</li>
          <li>Click a stamp and instantly seek the media to the stamp value.</li>
          <li>Your notes persist across page reloads unless you clear the browser cache.</li>
          <li>Save your project as a .stmp file, stamps included.</li>
          <li>Export your notes as a .pdf file, stamps excluded.</li>
          <li>Open your project back into the editor for further editing.</li>
        </ul>
      </pre>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        <strong style={{ color: '#FFC439' }}>
          Warning: </strong>This app is still in development and has only been tested on Chrome desktop.
      </pre>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        Features in development:
        <ul>
          <li>Cloud storage (subscription based plan)</li>
        </ul>
      </pre>
    </div>
  )
}

export default WelcomeMessage
