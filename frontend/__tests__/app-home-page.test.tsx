import { render, screen, fireEvent } from "@testing-library/react"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => (key === "topic" ? "general" : null)),
  }),
}))

// Mock URL.createObjectURL. Return a blob: URL like the real API does, since the
// page only renders previews whose src is an object URL.
global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/mocked-url")

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; [key: string]: unknown }) => {
    const { src, alt, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />
  },
}))

let InputFile: React.ComponentType
beforeAll(async () => {
  const mod = await import("@/app/app/page")
  InputFile = mod.default
})

describe("InputFile component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the image scan labels", () => {
    render(<InputFile />)
    expect(screen.getByText("Image Scan")).toBeInTheDocument()
    expect(screen.getByText("Solve your math question, step by step, by uploading an image")).toBeInTheDocument()
  })

  it("shows camera icon when no preview", () => {
    render(<InputFile />)
    expect(screen.getByText("Click to upload an image")).toBeInTheDocument()
  })

  it("displays preview when file is selected", () => {
    const { container } = render(<InputFile />)
    // Find the hidden file input
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    const file = new File(["dummy content"], "example.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    const img = screen.getByAltText("Preview") as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toBe("blob:http://localhost/mocked-url")
  })

  it("shows scan button after image upload", () => {
    const { container } = render(<InputFile />)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["dummy content"], "example.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(screen.getByText("Scan")).toBeInTheDocument()
  })

  it("triggers file input click when image is clicked", () => {
    const { container } = render(<InputFile />)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["dummy content"], "example.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
    const img = screen.getByAltText("Preview")
    const clickSpy = jest.spyOn(fileInput, "click")
    fireEvent.click(img)
    expect(clickSpy).toHaveBeenCalled()
  })
})