import { defaultMediaConfig } from "@/config"
import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { beforeEach } from "vitest"
import { vi } from "vitest"

const metadata = defaultMediaConfig.find(media => media.type === "recorder")

describe("When starting a new project", () => {
  const wavesurferLoadMock = vi.fn()
  const wavesurferLoadMockContext = wavesurferLoadMock.mock

  beforeEach(() => {
    vi.doMock("@wavesurfer/react", () => ({
      useWavesurfer: vi.fn(() => ({
        wavesurfer: {
          load: wavesurferLoadMock,
          registerPlugin: vi.fn(),
          on: vi.fn(),
          destroy: vi.fn(),
        },
      })),
    }))
  })

  test("it should render the placeholder", async () => {
    const { default: SoundRecorder } = await import(".")

    render(<SoundRecorder {...metadata} />)

    expect(screen.getByTestId("recorder")).toBeInTheDocument()
    expect(screen.getByTestId("wavesurfer-container")).toBeInTheDocument()
    expect(wavesurferLoadMock).toHaveBeenCalled()
    const callArgs = wavesurferLoadMockContext.calls[0]
    expect(callArgs.length).toBe(3)
  })
})
