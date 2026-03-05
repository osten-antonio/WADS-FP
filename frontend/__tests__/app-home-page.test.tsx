import { render, screen, fireEvent } from "@testing-library/react"
import InputFile from "@/app/app/page"

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url")

describe("InputFile component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the image scan labels", () => {
    render(<InputFile />)
    expect(screen.getByText("Image Scan")).toBeInTheDocument()
    expect(screen.getByText("Solve your math question, step by step, by uploading an image")).toBeInTheDocument()
  })

  it("shows camera icon and textarea when no preview", () => {
    render(<InputFile />)
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
    // Camera icon is an SVG, hard to test directly, but we can check for the input
    const fileInput = screen.getByTestId("picture")
    expect(fileInput).toBeInTheDocument()
  })

  it("displays preview when file is selected", () => {
    render(<InputFile />)
    const fileInput = screen.getByTestId("picture")
    const file = new File(["dummy content"], "example.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    const img = screen.getByAltText("preview")
    expect(img).toBeInTheDocument()
    expect(img.src).toBe("http://localhost/mocked-url")
  })

  it("clears text value when send button is clicked", () => {
    render(<InputFile />)
    const textarea = screen.getByPlaceholderText("Enter text")
    const sendButton = screen.getByRole("button")
    fireEvent.change(textarea, { target: { value: "test text" } })
    expect(textarea.value).toBe("test text")
    fireEvent.click(sendButton)
    expect(textarea.value).toBe("")
  })

  it("triggers file input click when image is clicked", () => {
    render(<InputFile />)
    const fileInput = screen.getByTestId("picture")
    const file = new File(["dummy content"], "example.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    const img = screen.getByAltText("preview")
    const clickSpy = jest.spyOn(fileInput, "click")
    fireEvent.click(img)
    expect(clickSpy).toHaveBeenCalled()
  })
})