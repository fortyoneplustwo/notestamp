import { screen, render } from "@testing-library/react"
import { describe, test, expect, vi } from "vitest"
import MediaRenderer from "./MediaRenderer"
import { defaultMediaConfig } from "@/config"

let setMediaRefMock = vi.fn()

vi.mock("../../context/ProjectContext", () => ({
  useProjectContext: vi.fn(() => ({
    setMediaRef: setMediaRefMock,
  })),
}))

describe("MediaRenderer", () => {
  describe("When metadata is not defined", () => {
    test("it should render the fallback message", async () => {
      const metadata = null

      render(<MediaRenderer metadata={metadata} />)
      await vi.dynamicImportSettled()

      expect(setMediaRefMock).not.toHaveBeenCalled()
      expect(
        screen.getByText(/oops! this media component does not exist/i)
      ).not.toBeNull()
    })
  })

  describe("When metadata.type does not exist", () => {
    test("it should render the fallback message", async () => {
      const metadata = {}

      render(<MediaRenderer metadata={metadata} />)
      await vi.dynamicImportSettled()

      expect(setMediaRefMock).not.toHaveBeenCalled()
      expect(
        screen.getByText(/oops! this media component does not exist/i)
      ).toBeInTheDocument()
    })
  })

  describe("When metadata.type does not correspond to an existing media component", () => {
    test("it should render the fallback message", async () => {
      const metadata = { type: "invalid" }

      render(<MediaRenderer metadata={metadata} />)
      await vi.dynamicImportSettled()

      expect(setMediaRefMock).not.toHaveBeenCalled()
      expect(
        screen.getByText(/oops! this media component does not exist/i)
      ).toBeInTheDocument()
    })
  })

  describe('When metadata.type is "youtube"', () => {
    test("it should render the youtube component", async () => {
      const metadata = defaultMediaConfig.find(
        media => media.type === "youtube"
      )
      const ref = vi.fn()

      render(<MediaRenderer ref={ref} metadata={metadata} />)
      await vi.dynamicImportSettled()
      expect(screen.getByTestId("loading-screen")).toBeInTheDocument()

      await vi.waitFor(() => {
        expect(screen.queryByTestId("loading-screen")).toBeNull()
      })

      expect(screen.getByTestId("youtube")).toBeInTheDocument()
    })
  })
})
