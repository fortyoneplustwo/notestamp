import React, { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import '../Button.css'
import "react-pdf/dist/Page/TextLayer.css"
import { Icon } from './Toolbar'
import { WithToolbar, Toolbar } from './MediaComponents'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfReader = React.forwardRef((_, ref) => {
  const [source, setSource] = useState(null)
  const [pageNumber, setPageNumber] = useState(null)
  const pageNumberRef = useRef(null)
  const [pageScale, setPageScale] = useState(1)


  useEffect(() => { pageNumberRef.current = pageNumber }, [pageNumber])

  useEffect(() => { source ? setPageNumber(1) : setPageNumber(null) }, [source])

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
    <WithToolbar style={{ overflow: 'hidden' }}>
      <Toolbar>
        <form onChange={e => { setSource(e.target.files[0]) }} 
          style={{ display: 'inline', color: 'black' }}
        >
          <input type='file' accept='application/pdf' />
        </form>
        <span style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
          <button onClick={() => { setPageScale(pageScale - 0.2) }}>
            <Icon>zoom_out</Icon>
          </button>
          <button style={{ marginRight: '8px' }} onClick={() => { setPageScale(pageScale + 0.2) }}>
            <Icon>zoom_in</Icon>
          </button>
          <button onClick={() => { setPageNumber(pageNumber - 1) }}>
            <Icon>chevron_left</Icon>
          </button>
          <button onClick={() => { setPageNumber(pageNumber + 1) }}>
            <Icon>chevron_right</Icon>
          </button>
        </span>
      </Toolbar>
      <div className='grid-background' style={{ color: 'black', overflow: 'auto', flex: '1' }}>
        {source
          && <Document file={source}>
              <Page pageNumber={pageNumber} 
                renderAnnotationLayer={false} 
                renderTextLayer={false} 
                scale={pageScale} 
              />
          </Document>
        }
      </div>
    </WithToolbar>
  );
})

export default PdfReader
