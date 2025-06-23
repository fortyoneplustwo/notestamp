import { defaultMediaConfig } from "@/config"
import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"

const metadata = defaultMediaConfig.find(media => media.type === "recorder")

describe("When starting a new project", () => {
  test("it should render the toolbar", async () => {
    const { default: YoutubePlayer } = await import(".")

    render(<YoutubePlayer {...metadata} />)

    expect(screen.getByTestId("youtube")).toBeInTheDocument()
    expect(screen.getByTestId("media-toolbar")).toBeInTheDocument()
  })
})

describe("When opening a saved project", () => {
  const props = { ...metadata, title: "fakeTitle", src: "fakeSrc" }

  test("it should not render the toolbar", async () => {
    const { default: YoutubePlayer } = await import(".")

    render(<YoutubePlayer {...props} />)

    expect(screen.getByTestId("youtube")).toBeInTheDocument()
    expect(screen.queryByTestId("media-toolbar")).not.toBeInTheDocument()
  })
})
