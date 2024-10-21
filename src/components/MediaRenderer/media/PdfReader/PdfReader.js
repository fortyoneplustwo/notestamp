import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import '../../style/Background.css'
import "react-pdf/dist/Page/TextLayer.css"
import { Icon } from '../../../Editor/components/Toolbar'
import { WithToolbar, Toolbar } from '../../components/Toolbar'
import { useGetProjectMedia } from '../../../../hooks/useReadData'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfReader = React.forwardRef((props, ref) => {
  const [source, setSource] = useState(null)
  const [pageNumber, setPageNumber] = useState(null)
  const pageNumberRef = useRef(null)
  const [pageScale, setPageScale] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const { data: pdf, fetchById: fetchPdfById } = useGetProjectMedia()

  useEffect(() => {
    if (props.title) {
      fetchPdfById(props.title)
    }
  }, [props.title, fetchPdfById])

  useEffect(() => {
    if (pdf) {
      console.log(pdf)
      setSource(pdf)
    }
  }, [pdf, setSource])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)

    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => { pageNumberRef.current = pageNumber }, [pageNumber])

  useEffect(() => { source ? setPageNumber(1) : setPageNumber(null) }, [source])

  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        // Using ref to access the state rather than returning the state
        // directly because of a weird bug that was returning only the 
        // initial state.
        if (source && pageNumberRef.current) {
          const pageNum = pageNumberRef.current
          return {
            label: pageNum ? `p. ${pageNum}` : null,
            value: pageNum ? pageNum : null
          } 
        }
      },
      setState: newState => {
        setPageNumber(newState)
      },
      getMetadata: () => { 
        return {
          ...props,
          src: '',
          mimetype: 'application/pdf'
        } 
      },
      getMedia: () => { 
        return props.title 
          ? null 
          : source 
            ? source 
            : null 
      }
    } 
  }, [source, props])


  return (
    <WithToolbar style={{ overflow: 'hidden' }} className="diagonal-background">
      <Toolbar className="bg-white">
        { !props.src &&
          <form onChange={e => { 
            setSource(e.target.files[0])
          }} 
            style={{ display: 'inline', color: 'black' }}
          >
            <input type='file' accept='application/pdf' className="text-xs" />
          </form>
        }
        <span
        className="flex ml-auto gap-2 items-right">
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
      <div 
        className='diagonal-background overflow-auto' 
        ref={containerRef}
      >
        {source && (
          <Document file={source}>
              <Page pageNumber={pageNumber} 
                renderAnnotationLayer={false} 
                renderTextLayer={false} 
                scale={pageScale} 
                width={containerWidth}
              />
          </Document>
        )}
      </div>
    </WithToolbar>
  );
})

export default PdfReader
