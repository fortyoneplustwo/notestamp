import { defaultMediaConfig } from "@/config"
import { describe, expect, test, beforeAll, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"

const metadata = defaultMediaConfig.find(media => media.type === "audio")

describe("When starting a new project", () => {
  beforeAll(() => {
    window.URL.revokeObjectURL = vi.fn()
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  beforeEach(() => {
    vi.doMock("@/hooks/useReadData", () => {
      const useGetProjectMediaMock = vi.fn(() => ({
        fetchById: vi.fn(),
      }))
      const useGetProjectMediaByUrlMock = vi.fn(() => ({
        fetchByUrl: vi.fn(),
      }))
      return {
        useGetProjectMedia: useGetProjectMediaMock,
        useGetProjectMediaByUrl: useGetProjectMediaByUrlMock,
      }
    })

    vi.doMock("@wavesurfer/react", () => ({
      useWavesurfer: vi.fn(() => ({
        wavesurfer: {
          load: vi.fn(),
          on: vi.fn(),
          destroy: vi.fn(),
        },
      })),
    }))
  })

  describe("and no media is provided ", () => {
    test("it should render the dropzone", async () => {
      const { default: AudioPlayer } = await import(".")

      render(<AudioPlayer {...metadata} />)

      expect(screen.getByTestId("audio-player")).toBeInTheDocument()
      expect(screen.getByText(/Drop your audio file here/i)).toBeInTheDocument()
    })
  })

  describe("and a media src is passed from the sound recorder", () => {
    const props = {
      ...metadata,
      src: "blob:https://test.com",
      mimetype: "audio/webm",
    }

    test("it should render the player and load the media", async () => {
      const { default: AudioPlayer } = await import(".")
      render(<AudioPlayer {...props} />)

      expect(screen.getByTestId("audio-player")).toBeInTheDocument()
      expect(
        screen.queryByText(/Drop your audio file here/i)
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId("change-file-input")).not.toBeInTheDocument()
    })

    test("it should not render the file input component", async () => {
      const { default: AudioPlayer } = await import(".")
      render(<AudioPlayer {...props} />)

      expect(screen.queryByTestId("change-file-input")).not.toBeInTheDocument()
    })
  })
})

describe("When opening a saved project", () => {
  beforeEach(() => {
    vi.doMock("@/hooks/useReadData", () => {
      const useGetProjectMediaMock = vi.fn(() => ({
        data: ["fakeData"],
        fetchById: vi.fn(),
        loading: false,
        error: false,
      }))
      const useGetProjectMediaByUrlMock = vi.fn(() => ({
        fetchByUrl: vi.fn(),
      }))
      return {
        useGetProjectMedia: useGetProjectMediaMock,
        useGetProjectMediaByUrl: useGetProjectMediaByUrlMock,
      }
    })

    vi.doMock("@wavesurfer/react", () => ({
      useWavesurfer: vi.fn(() => ({
        wavesurfer: {
          loadBlob: vi.fn(),
          on: vi.fn(),
          destroy: vi.fn(),
        },
      })),
    }))
  })

  test("it should render the media associated with the project", async () => {
    const { default: AudioPlayer } = await import(".")
    const props = { ...metadata, title: "fakeTitle" }

    render(<AudioPlayer {...props} />)

    expect(screen.getByTestId("audio-player")).toBeInTheDocument()
    expect(
      screen.queryByText(/Drop your audio file here/i)
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId("change-file-input")).not.toBeInTheDocument()
  })
})
