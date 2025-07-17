import { defaultMediaConfig } from "@/config"
import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { beforeEach } from "vitest"
import { vi } from "vitest"

const metadata = defaultMediaConfig.find(media => media.type === "recorder")

describe("When starting a new project", () => {
  beforeEach(() => {
    vi.doMock("@/hooks/useReadData", () => {
      const useGetProjectMediaMock = vi.fn(() => ({
        fetchById: vi.fn(),
      }))
      return {
        useGetProjectMedia: useGetProjectMediaMock,
      }
    })
  })

  test("it should render the dropzone", async () => {
    const { default: PdfReader } = await import(".")

    render(<PdfReader {...metadata} />)

    expect(screen.getByTestId("pdf-reader")).toBeInTheDocument()
    expect(screen.getByTestId("dropzone")).toBeInTheDocument()
  })
})

describe("When opening a saved project", () => {
  const props = {
    ...metadata,
    title: "fakeTitle",
  }

  beforeEach(() => {
    vi.doMock("@/hooks/useReadData", () => {
      const useGetProjectMediaMock = vi.fn(() => ({
        data: ["fakeData"],
        fetchById: vi.fn(),
        laoding: false,
        error: false,
      }))
      return {
        useGetProjectMedia: useGetProjectMediaMock,
      }
    })
  })

  test("it should not render the dropzone", async () => {
    const { default: PdfReader } = await import(".")

    render(<PdfReader {...props} />)

    expect(screen.getByTestId("pdf-reader")).toBeInTheDocument()
    expect(screen.queryByTestId("dropzone")).not.toBeInTheDocument()
  })

  test("it should not render the file-input", async () => {
    const { default: PdfReader } = await import(".")

    render(<PdfReader {...props} />)

    expect(screen.getByTestId("pdf-reader")).toBeInTheDocument()
    expect(screen.queryByTestId("file-input")).not.toBeInTheDocument()
  })
})
