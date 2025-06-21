import React, { useEffect, useImperativeHandle, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { pdfjs } from "react-pdf"
import "../../style/Background.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Toolbar } from "../../components/Toolbar"
import { useGetProjectMedia } from "../../../../hooks/useReadData"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dropzone } from "../../components/Dropzone"
import { FileUp } from "lucide-react"
import { FileInput } from "../../components/FileInput"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PdfReader = ({ ref, ...props }) => {
  const [source, setSource] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [renderedPageNumber, setRenderedPageNumber] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [pageScale, setPageScale] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)
  const { data: pdf, fetchById: fetchPdfById } = useGetProjectMedia()

  const isLoading = renderedPageNumber !== pageNumber

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
    window.addEventListener("resize", updateWidth)

    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    source ? setPageNumber(1) : setPageNumber(null)
  }, [source])

  useImperativeHandle(ref, () => {
    return {
      getState: () => {
        if (source) {
          return {
            label: pageNumber ? `p. ${pageNumber}` : null,
            value: pageNumber,
          }
        }
      },
      setState: newState => {
        setPageNumber(newState)
      },
      getMetadata: () => {
        return {
          ...props,
          src: "",
          mimetype: "application/pdf",
        }
      },
      getMedia: () => {
        return props.title ? null : source
      },
    }
  }, [source, props, pageNumber])

  const handleOnChangeUpload = file => {
    setSource(file)
  }

  return (
    <div
      data-testid="pdf-reader"
      className="flex flex-col h-full overflow-hidden diagonal-background"
    >
      {(props.title || source) && (
        <Toolbar className="dark:bg-[#1d2021]">
          {!props.title && source && (
            <FileInput
              accept="application/pdf"
              filename={source?.name}
              onChange={handleOnChangeUpload}
            />
          )}
          <span className="flex ml-auto gap-2 items-right">
            <Button
              variant="ghost"
              size="xs"
              title="Zoom out"
              onClick={() => {
                setPageScale(pageScale - 0.2)
              }}
            >
              <ZoomOut />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              title="Zoom in"
              onClick={() => {
                setPageScale(pageScale + 0.2)
              }}
            >
              <ZoomIn />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              title="Previous page"
              onClick={() => {
                pageNumber > 1 && setPageNumber(pageNumber - 1)
              }}
            >
              <ChevronLeft />
            </Button>
            {source && (
              <span className="text-sm w-20 p-0 text-center inline-block">
                <span>
                  <Input
                    className="h-6 text-sm p-0 m-0 w-10 inline-block text-center border-none"
                    value={pageNumber}
                    onSubmit={e => {
                      if (e.target.value > 0 && e.target.value < numPages) {
                        setPageNumber(e.target.value)
                      }
                    }}
                    onChange={e => {
                      const value = e.target.value
                      if (/^\d*$/.test(value)) {
                        setPageNumber(value === "" ? "" : parseInt(value, 10))
                      }
                    }}
                    onFocus={e => e.target.select()}
                    type="text"
                  />
                </span>
                <span className="mx-2">/</span>
                <span>{numPages}</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="xs"
              title="Next page"
              onClick={() => {
                pageNumber < numPages && setPageNumber(pageNumber + 1)
              }}
            >
              <ChevronRight />
            </Button>
          </span>
        </Toolbar>
      )}
      {!props.title && !source && (
        <div className="flex items-center justify-center h-full">
          <Dropzone
            icon={FileUp}
            message="Drop your PDF document here"
            accept={{ "application/pdf": [] }}
            onAccept={handleOnChangeUpload}
          />
        </div>
      )}
      <div className="overflow-auto" ref={containerRef}>
        {source && (
          <Document
            file={source}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {isLoading && renderedPageNumber ? (
              <Page
                key={renderedPageNumber}
                pageNumber={renderedPageNumber}
                renderAnnotationLayer={false}
                scale={pageScale}
                width={containerWidth}
              />
            ) : null}
            <Page
              key={pageNumber}
              pageNumber={pageNumber}
              onRenderSuccess={() => setRenderedPageNumber(pageNumber)}
              renderAnnotationLayer={false}
              scale={pageScale}
              width={containerWidth}
            />
          </Document>
        )}
      </div>
    </div>
  )
}

export default PdfReader
