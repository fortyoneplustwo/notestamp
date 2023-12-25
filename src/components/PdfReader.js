import React, { useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf';
import BackButton from './BackButton.js';
import '../Button.css'
import '../MediaComponent.css'
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfReader = React.forwardRef((props, ref) => {
  const { closeComponent, src } = props
  const [pageNumber, setPageNumber] = useState(1);
  const [pageScale, setPageScale] = useState(1);


  ////////////////////////////////
  /// Initialize controller //////
  ////////////////////////////////

  useEffect(()=> {
    // Parent component can use this controller using ref
    const controller = {
      getState: function (data = null) {
        return pageNumber
      },
      setState: function (newState) {
        setPageNumber(newState)
      }
    } 
    ref.current = controller
  }, [pageNumber, ref])

  return (
    <div className='media-component-container'>
      <div className='back-btn-container'>
        <BackButton handler={closeComponent} />
        <button style={{ float: 'right' }} onClick={() => { setPageNumber(pageNumber + 1) }}>Next</button>
        <button style={{ float: 'right' }} onClick={() => { setPageNumber(pageNumber - 1) }}>Prev</button>
        <button style={{ float: 'right', marginRight: '10px' }} onClick={() => { setPageScale(pageScale - 0.2) }}>Zoom out</button>
        <button style={{ float: 'right' }} onClick={() => { setPageScale(pageScale + 0.2) }}>Zoom in</button>
      </div>
      <div style={{ overflow: 'scroll'}}>
          <Document file={src}>
            <Page pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} scale={pageScale} />
          </Document>
      </div>
    </div>
  );
})

export default PdfReader
