import { render, screen, fireEvent } from "@testing-library/react"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"
import { Result } from "@/components/calculator/Result"

describe("FunctionSelector", () => {
  it("renders categories", () => {
    render(<FunctionSelector onSelect={jest.fn()} />)
    expect(screen.getByText("Basic")).toBeInTheDocument()
    expect(screen.getByText("Trigonometric")).toBeInTheDocument()
    expect(screen.getByText("Advanced")).toBeInTheDocument()
  })

  it("has search input", () => {
    render(<FunctionSelector onSelect={jest.fn()} />)
    expect(screen.getByPlaceholderText("Search functions...")).toBeInTheDocument()
  })
})

describe("Result", () => {
  it("shows Solution heading", () => {
    render(<Result />)
    expect(screen.getByText("Solution")).toBeInTheDocument()
  })

  it("shows tab buttons: Steps, Hints, Practices", () => {
    render(<Result />)
    expect(screen.getByText(/Steps/i)).toBeInTheDocument()
    expect(screen.getByText(/Hints/i)).toBeInTheDocument()
    expect(screen.getByText(/Practices/i)).toBeInTheDocument()
  })

  it("hides result value when Hide is clicked", () => {
    render(<Result />)
    fireEvent.click(screen.getByLabelText("Unhide"))
    fireEvent.click(screen.getByLabelText("Hide"))
    expect(screen.getByLabelText("Unhide")).toBeInTheDocument()
  })

  it("reveals result value when Unhide is clicked", () => {
    render(<Result />)
    fireEvent.click(screen.getByLabelText("Unhide"))
    expect(screen.getByLabelText("Hide")).toBeInTheDocument()
  })
})