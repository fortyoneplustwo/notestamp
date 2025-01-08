import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import '../../style/Background.css'
import "react-pdf/dist/Page/TextLayer.css"
import { Toolbar } from '../../components/Toolbar'
import { useGetProjectMedia } from '../../../../hooks/useReadData'
import { MediaToolbarButton } from '@/components/Button/Button'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Input } from '@/components/ui/input'

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
    <div className="flex flex-col h-full overflow-hidden diagonal-background">
      <Toolbar className="dark:bg-[#1d2021]">
        { !props.src && !props.title &&
          <form onChange={e => { 
            setSource(e.target.files[0])
          }} 
            className="flex w-full max-w-sm items-center gap-1.5"
          >
            <Input className="h-6 p-0 text-xs" type="file" accept="application/pdf" />
          </form>
        }
        <span
        className="flex ml-auto gap-2 items-right">
          <MediaToolbarButton variant="ghost" title="Zoom out" onClick={() => { setPageScale(pageScale - 0.2) }}>
            <ZoomOut />
          </MediaToolbarButton>
          <MediaToolbarButton variant="ghost"  title="Zoom in" onClick={() => { setPageScale(pageScale + 0.2) }}>
            <ZoomIn />
          </MediaToolbarButton>
          <MediaToolbarButton variant="ghost" title="Previous page" onClick={() => { setPageNumber(pageNumber - 1) }}>
            <ChevronLeft />
          </MediaToolbarButton>
          <MediaToolbarButton variant="ghost" title="Next page" onClick={() => { setPageNumber(pageNumber + 1) }}>
            <ChevronRight />
          </MediaToolbarButton>
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
    </div>
  );
})

export default PdfReader
