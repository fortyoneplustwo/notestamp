import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav>
        <ul style={{margin: '0', padding: '0 10px 10px 10px'}}>
          <button className='nav-btn' 
            onClick={() => { 
              setReaderState({
                type: 'youtube',
                src: ''
              })
            setShowMedia(true)
          }}>
              Play YouTube video
          </button>
          <button className='nav-btn' 
            onClick={() => audioUploadModalRef.current.showModal()}>
              Open audio file
          </button>
          <button className='nav-btn' 
            onClick={() => {
              setReaderState({ type: 'recorder' })
              setShowMedia(true)
            }}>
              Record audio
          </button>
          <button className='nav-btn' 
            onClick={() => pdfUploadModalRef.current.showModal()}>
              Open PDF document
          </button>
        </ul>
      </nav>
    </div>
  )
}
