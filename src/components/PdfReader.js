import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf';
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfReader = () => {
  const [pageNumber, setPageNumber] = useState(55);

  return (
    <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: 'blue'}}>
        <Document file="/Dsa.pdf" style={{ overflow: 'auto' }}>
          <Page pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} scale={1} />
        </Document>
    </div>
  );
}

export default PdfReader
