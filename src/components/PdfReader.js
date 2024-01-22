import React, { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import '../Button.css'
import '../MediaComponent.css'
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfReader = React.forwardRef((props, ref) => {
  const [source, setSource] = useState(null)
  const [pageNumber, setPageNumber] = useState(null)
  const pageNumberRef = useRef(null)
  const [pageScale, setPageScale] = useState(1)


  useEffect(() => { pageNumberRef.current = pageNumber }, [pageNumber])

  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////

  useEffect(()=> {
    const controller = {
      getState: function () {
        // NOTE: Closures always return the initial value of a state variable.
        // Returning the ref ensures we grab the current state.
        return pageNumberRef.current
      },
      setState: function (newState) {
        setPageNumber(newState)
      }
    } 
    ref.current = controller
  }, [pageNumber, ref])


  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'scroll', gap: '10px' }}>
      <div style={{ width: '100%' }}>
        <form onChange={e => { setSource(e.target.files[0]); setPageNumber(1) }} style={{ display: 'inline' }}>
          <input type='file' accept='application/pdf' />
        </form>
        <button style={{ float: 'right' }} onClick={() => { setPageNumber(pageNumber + 1) }}>Next</button>
        <button style={{ float: 'right', marginRight: '2px' }} onClick={() => { setPageNumber(pageNumber - 1) }}>Prev</button>
        <button style={{ float: 'right', marginRight: '10px' }} onClick={() => { setPageScale(pageScale - 0.2) }}>Zoom out</button>
        <button style={{ float: 'right', marginRight: '2px' }} onClick={() => { setPageScale(pageScale + 0.2) }}>Zoom in</button>
      </div>
      <div style={{ overflow: 'scroll'}}>
          <Document file={source}>
            <Page pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} scale={pageScale} />
          </Document>
      </div>
    </div>
  );
})

export default PdfReader
